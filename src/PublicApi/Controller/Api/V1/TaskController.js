import assert from 'assert'

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

    assert.notStrictEqual(null, req.body.taskTypeName, 'Missing taskTypeName.')
    assert.notStrictEqual(undefined, req.body.taskTypeName, 'Missing taskTypeName.')
    assert.notStrictEqual('', req.body.taskTypeName, 'Missing taskTypeName.')

    if (undefined !== req.body.components) {
      assert(req.body.components instanceof Array, 'Expecting components to be array.')
      assert(req.body.components.length > 0, 'Empty components.')

      if (req.body.components.indexOf('commandBased') !== -1) {
        assert.notStrictEqual(null, req.body.command, 'Missing command.')
        assert.notStrictEqual(undefined, req.body.command, 'Missing command.')
        assert.notStrictEqual('', req.body.command, 'Missing command.')
      }
    }

    const task = this._taskBuilder.buildTask({
      components: req.body.components,
      createdBy: req.body.createdBy,
      taskTypeId: req.body.taskTypeId,
      taskTypeName: req.body.taskTypeName,
      command: req.body.command
    })

    this._mongoClient
      .collection('nest', 'task')
      .then(function (collection) {
        collection
          .insertOne(task)
          .then(function() {
            res.send({ status: 'success' })
          })
      })
  }

  getTask(req, res, id) {
    this._mongoClient
      .collection('nest', 'task')
      .then(function (collection) {
        collection
          .find({ '_id': id })
          .limit(1)
          .next(function(err, doc){
            if (null === doc) {
              res.status(404).send({ status: 'not_found' })
            } else {
              res.send(doc)
            }
          })
      })
  }

  listTasks(req, res) {
    const from = req.query.from
    const limit = req.query.limit

    assert.notStrictEqual(undefined, from, 'Missing from')
    assert.notStrictEqual(undefined, limit, 'Missing limit')

    this._mongoClient
      .collection('nest', 'task')
      .then(function (collection) {
        // console.log(collection.find().sort({ 'data.createdAt': -1 })
        // .limit(limit)
        // .skip(from)

        collection
          .find()
          .sort({ 'data.createdAt': -1 })
          .limit(1)
          .toArray(function(err, docs) {
            assert.strictEqual(null, err)

            res.send(docs)
          })
      })
  }

  register(app) {
    app.post('/api/v1/task', this.putTask.bind(this))
    app.get('/api/v1/task/:id', this.getTask.bind(this))
    app.get('/api/v1/task', this.listTasks.bind(this))
  }
}

export default TaskController