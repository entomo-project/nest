import assert from 'assert'
import { ObjectID } from 'mongodb'
import Promise from 'bluebird'

class TaskController{
  constructor(mongoClient, taskBuilder) {
    this._mongoClient = mongoClient
    this._taskBuilder = taskBuilder
  }

  putTask(req, res) {
    assert.notStrictEqual(null, req.body.components, 'Missing components.')

    assert.notStrictEqual(null, req.body.createdBy, 'Missing createdBy.')
    assert.notStrictEqual(undefined, req.body.createdBy, 'Missing createdBy.')
    assert.notStrictEqual('', req.body.createdBy, 'Missing createdBy.')

    assert.notStrictEqual(null, req.body.taskTypeId, 'Missing taskTypeId.')
    assert.notStrictEqual(undefined, req.body.taskTypeId, 'Missing taskTypeId.')
    assert.notStrictEqual('', req.body.taskTypeId, 'Missing taskTypeId.')

    let startAfter = undefined

    if (undefined !== req.body.components) {
      assert(req.body.components instanceof Array, 'Expecting components to be array.')
      assert(req.body.components.length > 0, 'Empty components.')

      if (req.body.components.indexOf('commandBased') !== -1) {
        assert.notStrictEqual(null, req.body.command, 'Missing command.')
        assert.notStrictEqual(undefined, req.body.command, 'Missing command.')
        assert.notStrictEqual('', req.body.command, 'Missing command.')
      }

      if (req.body.components.indexOf('startAfter') !== -1) {
        assert.notStrictEqual(null, req.body.startAfter, 'Missing startAfter.')
        assert.notStrictEqual(undefined, req.body.startAfter, 'Missing startAfter.')
        assert.notStrictEqual('', req.body.startAfter, 'Missing startAfter.')

        startAfter = new Date(req.body.startAfter)

        assert(
          !isNaN(startAfter.getTime()),
          'Invalid startAfter "' + req.body.startAfter + '".'
        )
      }
    }

    const task = this._taskBuilder.buildTask({
      components: req.body.components,
      createdBy: req.body.createdBy,
      taskTypeId: req.body.taskTypeId,
      command: req.body.command,
      startAfter: startAfter
    })

    this._mongoClient
      .collection('nest', 'task')
      .then((collection) => {
        collection
          .insertOne(task)
          .then(() => {
            res.send({ status: 'success' })
          })
          .done()
      })
      .done()
  }

  getTask(req, res) {
    this._mongoClient
      .collection('nest', 'task')
      .then((collection) => {
        collection
          .find({ '_id': ObjectID(req.params.id) })
          .limit(1)
          .next()
          .then((doc) => {
            if (null === doc) {
              res.status(404).send({ status: 'not_found' })
            } else {
              res.send(doc)
            }
          })
          .done()
      })
      .done()
  }

  listTasks(req, res) {
    const from = req.query.from === undefined ? 0 : parseInt(req.query.from, 10)
    const limit = req.query.limit === undefined ? 10 : parseInt(req.query.limit, 10)

    this._mongoClient
      .collection('nest', 'task')
      .then((collection) => {
        var result
        var total

        Promise.all(
          [
            collection
              .find()
              .sort({ 'data.createdAt': -1 })
              .skip(from)
              .limit(limit)
              .toArray()
              .then((docs) => {
                result = docs
              }),
            collection
              .count()
              .then((iTotal) => {
                total = iTotal
              })
          ]
        ).then(() => {
          res.send({
            result: result,
            info: {
              total: total,
              filteredTotal: total //TODO
            }
          })
        }).done()
      })
      .done()
  }

  register(app) {
    app.post('/api/v1/task', this.putTask.bind(this))
    app.get('/api/v1/task/:id', this.getTask.bind(this))
    app.get('/api/v1/task', this.listTasks.bind(this))
  }
}

export default TaskController