import assert from 'assert'
import initServer from '@bmichalski/basic-hapi-api-server'
import { ObjectID } from 'mongodb'

class SchedulerService {
  constructor(
    schedulerHost,
    schedulerPort,
    logger,
    mongoClient,
    rp,
    queueSize,
    workerBaseUrl
  ) {
    this._schedulerHost = schedulerHost
    this._schedulerPort = schedulerPort
    this._logger = logger
    this._mongoClient = mongoClient
    this._rp = rp
    this._queueSize = queueSize
    this._workerBaseUrl = workerBaseUrl

    this._elementsInQueue = 0
    this._queue = {}
  }

  start() {
    this._logger.info('Scheduler started.')

    setInterval(this._main.bind(this), 1000)

    initServer({
      api: {
        name: 'Scheduler service',
        version: '1',
        hasDocumentation: true,
        routes: [
          {
            method: 'PUT',
            path:'/api/v1/task/started',
            handler: this._taskStarted.bind(this)
          },
          {
            method: 'PUT',
            path:'/api/v1/task/stopped',
            handler: this._taskStopped.bind(this)
          }
        ]
      },
      server: {
        connections: [
          {
            host: this._schedulerHost,
            port: this._schedulerPort
          }
        ]
      }
    }).then((server) => {
      server.start(() => {
        console.log('Scheduler service started, listening on port ' + this._schedulerPort)
      })
    })
  }

  _taskStarted(req, res) {
    const payload = req.payload

    assert.notStrictEqual(null, payload.taskId)
    assert.notStrictEqual(undefined, payload.taskId)
    assert.notStrictEqual('', payload.taskId)

    this._logger.info('Notified by scheduler that task has started.', { _id: payload.taskId })

    this
      ._mongoClient
      .collection('nest', 'task')
      .then((collection) => {
        collection
          .update({ _id: ObjectID(payload.taskId) }, { $set: { 'data.startedAt': new Date() } })
          .then((data) => {
            if (data.result.nModified !== 1) {
              res.status(400).send({ status: 'error' })

              this._logger.error('Error marking task as started: expecting exactly one document to be modified, got ' + data.result.nModified + '.')

              return
            }

            this._logger.info('Marked task as started.', { _id: payload.taskId });

            res({ status: 'success' })
          })
      })
  }

  _taskStopped(req, res) {
    const payload = req.payload

    const taskId = payload.taskId
    const output = payload.output
    const workerError = payload.error

    assert.notStrictEqual(null, taskId)
    assert.notStrictEqual(undefined, taskId)
    assert.notStrictEqual('', taskId)
    assert.notStrictEqual(undefined, output)

    this._logger.info('Notified by worker that task is done.', { _id: taskId, output: output });

    const $set = {
      'data.stoppedAt': new Date(),
      'data.output': output
    }

    if (undefined !== workerError) {
      $set.workerError = workerError
    }

    this._mongoClient
      .collection('nest', 'task')
      .then((collection) => {
        collection
          .update({ _id: ObjectID(taskId) }, { $set: $set })
          .then((data) => {
            if (data.result.nModified !== 1) {
              res.status(400).send({ status: 'error' })

              this._logger.error('Error marking task as done: expecting exactly one document to be modified, got ' + data.result.nModified + '.')

              return
            }

            this._logger.info('Marked task as done.', { _id: taskId });

            this._removeTaskFromQueue(taskId)

            res({ status: 'success' })
          })
      })
  }

  _addToQueueIfPossible(task) {
    const _id = task._id

    if (undefined === this._queue[_id] && this._elementsInQueue < this._queueSize) {
      this._logger.info('Adding a task to the queue.', { task: { _id: _id.toString() } })

      this._queue[_id] = task
      this._elementsInQueue += 1

      this._logger.info('Notifying worker.')

      this
        ._rp({
          method: 'POST',
          uri: this._workerBaseUrl + '/do',
          body: {
            taskId: _id,
            command: task.data.command
          },
          json: true
        })
        .then(() => {
          this._logger.info('Worker notified.')
        })
        .catch((e) => {
          this._logger.error('Could not notify worker.', { error: e })
        })
    }
  }

  _removeTaskFromQueue(taskId) {
    delete this._queue[taskId]
    this._elementsInQueue -= 1
  }

  _main() {
    //Limit 4

    const now = new Date().toISOString()

    this
      ._mongoClient
      .collection('nest', 'task')
      .then((collection) => {
        collection
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
                  $lte: new Date(now)
                }
              }
            ]
          })
          .limit(8)
          .toArray()
          .then((docs) => {
            docs.forEach((doc) => {
              this._addToQueueIfPossible(doc)
            })
          })
      })
  }
}

export default SchedulerService