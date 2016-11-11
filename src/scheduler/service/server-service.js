import Promise from 'bluebird'
import initServer from '@bmichalski/basic-hapi-api-server'
import { ObjectID } from 'mongodb'
import Joi from 'joi'
import Boom from 'boom'
import _ from 'lodash'
import assert from 'assert'

class SchedulerService {
  constructor(
    schedulerHost,
    schedulerHttps,
    logger,
    timeService,
    taskRoutes,
    queueSize,
    workerNotifier,
    workers,
    taskCollection
  ) {
    this._schedulerHost = schedulerHost
    this._schedulerHttps = schedulerHttps
    this._logger = logger
    this._timeService = timeService
    this._taskRoutes = taskRoutes
    this._queueSize = queueSize
    this._workerNotifier = workerNotifier
    this._workers = workers
    this._taskCollection = taskCollection

    this._elementsInQueue = 0
    this._queue = {}
  }

  start() {
    this._logger.info('Scheduler started.')

    const scheduleMain = () => {
      return Promise.delay(1000).then(this._main.bind(this))
    }

    const validateConfNode = {
      params: {
        id: Joi.string().regex(/^[0-9a-fA-F]{24}$/)
      }
    }

    const routes = [
      {
        method: 'PUT',
        path:'/api/task/{id}/started',
        handler: this._taskStarted.bind(this),
        config: {
          validate: _.extend({}, validateConfNode)
        }
      },
      {
        method: 'PUT',
        path:'/api/task/{id}/stopped',
        handler: this._taskStopped.bind(this),
        config: {
          validate: _.extend({}, validateConfNode, {
            payload: {
              stdout: Joi.string().required().allow(''),
              stderr: Joi.string().required().allow('')
            }
          })
        }
      }
    ]

    this._taskRoutes.register(routes)

    return initServer({
      api: {
        name: 'Scheduler service',
        version: '1',
        hasDocumentation: true,
        routes
      },
      server: {
        connections: [
          {
            host: this._schedulerHost,
            port: this._schedulerHttps.port,
            tls: {
              key: this._schedulerHttps.key,
              cert: this._schedulerHttps.cert
            }
          }
        ]
      }
    }).then((server) => {
      this._server = server

      return new Promise((resolve) => {
        server.event('app.task_added_to_queue')
        server.event('app.task_removed_from_queue')
        server.event('app.task_not_added_to_full_queue')
        server.event('app.task_not_added_already_in_queue')
        server.event('app.check_if_tasks')

        server.on('app.task_added_to_queue', (data) => {
          this._logger.info('Task added to queue.', data)
        })

        server.on('app.task_not_added_to_full_queue', (data) => {
          this._logger.info('Task not added to queue: queue is full.', data)
        })

        server.on('app.task_not_added_already_in_queue', (data) => {
          this._logger.error('Task not added to queue: already in queue.', data)
        })

        server.on('app.task_removed_from_queue', (data) => {
          this._logger.info('Task removed from queue.', data)
        })

        server.on('app.check_if_tasks', this._main.bind(this))

        server.start(() => {
          this._logger.info('Scheduler service started, listening on port ' + this._schedulerHttps.port)

          this._main().then(scheduleMain)

          resolve(server)
        })
      })
    })
  }

  _taskStarted(req, res) {
    const taskId = req.params.id

    this._logger.info('Notified by worker that task has started.', { _id: taskId })

    this._taskCollection
      .updateOne({ _id: ObjectID(taskId) }, { $set: { 'data.base.startedAt': this._timeService.getNowDate() } })
      .then((data) => {
        if (data.result.nModified !== 1) {
          this._logger.error('Error marking task as started: expecting exactly one document to be modified, got ' + data.result.nModified + '.')

          return res(Boom.notFound())
        }

        this._logger.info('Marked task as started.', { _id: taskId })

        return res({ status: 'success' })
      })
  }

  _taskStopped(req, res) {
    const taskId = req.params.id
    const payload = req.payload
    const stdout = payload.stdout
    const stderr = payload.stderr

    this._logger.info('Notified by worker that task has stopped.', { _id: taskId, stdout, stderr })

    this._taskCollection
      .update(
        { _id: ObjectID(taskId) },
        {
          $set: {
            'data.commandBased.stoppedAt': this._timeService.getNowDate(),
            'data.commandBased.stdout': stdout,
            'data.commandBased.stderr': stderr
          }
        }
      )
      .then((data) => {
        if (data.result.nModified !== 1) {
          this._logger.error('Error marking task as stopped: expecting exactly one document to be modified, got ' + data.result.nModified + '.')

          return res(Boom.notFound())
        }

        this._logger.info('Marked task as stopped.', { _id: taskId })

        this._removeTaskFromQueue(taskId)

        return res({ status: 'success' })
      })
  }

  _addToQueueIfPossible(task) {
    assert.notStrictEqual(undefined, task._id, 'Missing task._id.')
    assert.notStrictEqual(undefined, task.data, 'Missing task.data.')
    assert.notStrictEqual(undefined, task.data.commandBased, 'Missing task.data.commandBased.')
    assert.notStrictEqual(undefined, task.data.commandBased.command, 'Missing task.data.commandBased.command.')

    const _id = task._id

    if (undefined === this._queue[_id]) {
      if (this._elementsInQueue < this._queueSize) {
        this._queue[_id] = task
        this._elementsInQueue += 1

        this._server.emit('app.task_added_to_queue', { task: { _id: _id.toString() }})

        this._logger.info('Notifying worker.')

        this._workerNotifier.notify({
          taskId: _id,
          command: task.data.commandBased.command,
          //FIXME,
          baseUrl: this._workers[0].baseUrl
        })
      } else {
        this._server.emit('app.task_not_added_to_full_queue', { task: { _id: _id.toString() }})
      }
    } else {
      this._server.emit('app.task_not_added_already_in_queue', { task: { _id: _id.toString() }})
    }
  }

  _removeTaskFromQueue(taskId) {
    if (undefined === this._queue[taskId]) {
      throw new Error('Error removing task with id "' + taskId + '" from queue: no such task in queue.')
    }

    delete this._queue[taskId]

    this._elementsInQueue -= 1

    this._server.emit('app.task_removed_from_queue', { task: { _id: taskId }})
  }

  _main() {
    //Limit 4

    //Prevent simultaneous executions of following async code
    if (this._checkingForTasks) {
      return Promise.resolve()
    }

    this._checkingForTasks = true

    return new Promise((resolve) => {
      this._taskCollection
        .find({
          'meta.components.': 'commandBased',
          'data.startedAt': null,
          $or: [
            {
              'data.startAfter': {
                $exists: false
              }
            },
            {
              'data.startAfter': {
                $lte: this._timeService.getNowDate()
              }
            }
          ]
        })
        .limit(4)
        .toArray()
        .then((docs) => {
          docs.forEach((doc) => {
            this._addToQueueIfPossible(doc)
          })

          this._checkingForTasks = false

          resolve()
        })
    })
  }
}

export default SchedulerService