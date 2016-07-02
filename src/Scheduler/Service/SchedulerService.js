import assert from 'assert'
import { ObjectID } from 'mongodb'

class SchedulerService {
  constructor(logger, mongoClient, rp, webServerFactory, port, queueSize) {
    this._logger = logger
    this._mongoClient = mongoClient
    this._rp = rp
    this._webServerFactory = webServerFactory
    this._port = port
    this._queueSize = queueSize

    this._elementsInQueue = 0
    this._queue = {}
  }

  start() {
    this._logger.info('Scheduler started.');

    setInterval(this._main.bind(this), 1000);

    const app = this._webServerFactory();

    app.put('/api/v1/task/started', this._taskStarted.bind(this))
    app.put('/api/v1/task/done', this._taskDone.bind(this))

    app.listen(this._port, () => {
      this._logger.info('Scheduler listening.', { port: this._port });
    });
  }

  _taskStarted(req, res) {
    const that = this

    assert.notStrictEqual(null, req.body.taskId)
    assert.notStrictEqual(undefined, req.body.taskId)
    assert.notStrictEqual('', req.body.taskId)

    this._logger.info('Notified by scheduler that task has started.', { _id: req.body.taskId })

    this._mongoClient
      .collection('nest', 'task')
      .then(function (collection) {
        collection
          .update({ _id: ObjectID(req.body.taskId) }, { $set: { 'data.startedAt': new Date() } })
          .then(function() {
            that._logger.info('Marked task as started.', { _id: req.body.taskId });

            res.send({ status: 'success' })
          })
      })
  }

  _taskDone(req, res) {
    const that = this
    const taskId = req.body.taskId

    assert.notStrictEqual(null, taskId)
    assert.notStrictEqual(undefined, taskId)
    assert.notStrictEqual('', taskId)

    this._logger.info('Notified by worker that task is done.', { _id: taskId });

    this._mongoClient
      .collection('nest', 'task')
      .then((collection) => {
        collection
          .update({ _id: ObjectID(taskId) }, { $set: { 'data.stoppedAt': new Date() } })
          .then((data) => {
            if (data.result.nModified !== 1) {
              res.status(400).send({ status: 'error' })

              this._logger.error('Expecting exactly one document to be modified, got ' + data.result.nModified + '.')

              return
            }

            that._logger.info('Marked task as done.', { _id: taskId });

            that._removeTaskFromQueue(taskId)

            res.send({ status: 'success' })
          })
      })
  }

  _addToQueueIfPossible(task) {
    const that = this
    const _id = task._id

    if (undefined === this._queue[_id] && this._elementsInQueue < this._queueSize) {
      this._logger.info('Adding a task to the queue.', { task: { _id: _id.toString() } })

      this._queue[_id] = task
      this._elementsInQueue += 1

      this._logger.info('Notifying worker.');

      that._rp({
        method: 'POST',
        uri: 'http://localhost:3003/do',
        body: {
          taskId: _id,
          command: 'console.log(\'oui mon seigneur\'); done();'
        },
        json: true
      }).then(function () {
        that._logger.info('Worker notified.');
      }).catch(function () {
        that._logger.error('Could not notify worker.');
      });
    } else {
      // that._logger.debug('Task queue is full.')
    }
  }

  _removeTaskFromQueue(taskId) {
    delete this._queue[taskId];
    this._elementsInQueue -= 1
  }

  _main() {
    const that = this

    this._mongoClient
      .collection('nest', 'task')
      .then(function (collection) {
        collection
          .find({ 'meta.components.': 'commandBased', 'data.startedAt': null })
          .toArray(function(err, docs) {
            assert.strictEqual(null, err);

            docs.forEach(function (doc) {
              that._addToQueueIfPossible(doc)
            })
          })
      })
  }
}

export default SchedulerService