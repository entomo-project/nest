import assert from 'assert'
import { ObjectID } from 'mongodb'

class SchedulerService {
  constructor(logger, mongoClient, rp, webServerFactory, webServers, queueSize) {
    this._logger = logger
    this._mongoClient = mongoClient
    this._rp = rp
    this._webServerFactory = webServerFactory
    this._webServers = webServers
    this._queueSize = queueSize

    this._elementsInQueue = 0
    this._queue = {}
  }

  start() {
    this._logger.info('Scheduler started.')

    setInterval(this._main.bind(this), 1000)

    const app = this._webServerFactory()

    app.put('/api/v1/task/started', this._taskStarted.bind(this))
    app.put('/api/v1/task/stopped', this._taskStopped.bind(this))

    this._webServers.forEach((webServer) => {
      app.listen(webServer.port, webServer.hostname, () => {
        this._logger.info('Scheduler listening.', { port: webServer.port, hostname: webServer.hostname })
      })
    })
  }

  _taskStarted(req, res) {
    assert.notStrictEqual(null, req.body.taskId)
    assert.notStrictEqual(undefined, req.body.taskId)
    assert.notStrictEqual('', req.body.taskId)

    this._logger.info('Notified by scheduler that task has started.', { _id: req.body.taskId })

    this
      ._mongoClient
      .collection('nest', 'task')
      .then((collection) => {
        collection
          .update({ _id: ObjectID(req.body.taskId) }, { $set: { 'data.startedAt': new Date() } })
          .then((data) => {
            if (data.result.nModified !== 1) {
              res.status(400).send({ status: 'error' })

              this._logger.error('Error marking task as started: expecting exactly one document to be modified, got ' + data.result.nModified + '.')

              return
            }

            this._logger.info('Marked task as started.', { _id: req.body.taskId });

            res.send({ status: 'success' })
          })
          .done()
      })
      .done()
  }

  _taskStopped(req, res) {
    const taskId = req.body.taskId
    const output = req.body.output
    const workerError = req.body.error

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

            res.send({ status: 'success' })
          })
          .done()
      })
      .done()
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
          uri: 'http://localhost:3003/do',
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
        .done()
    }
  }

  _removeTaskFromQueue(taskId) {
    delete this._queue[taskId]
    this._elementsInQueue -= 1
  }

  _main() {
    //Limit 4
    this
      ._mongoClient
      .collection('nest', 'task')
      .then((collection) => {
        collection
          .find({ 'meta.components.': 'commandBased', 'data.startedAt': null })
          .limit(8)
          .toArray()
          .then((docs) => {
            docs.forEach((doc) => {
              this._addToQueueIfPossible(doc)
            })
          })
          .done()
      })
      .done()
  }
}

export default SchedulerService