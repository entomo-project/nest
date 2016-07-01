import assert from 'assert'

class TaskController{
  constructor(mongoClient, taskBuilder) {
    this._mongoClient = mongoClient
    this._taskBuilder = taskBuilder
  }

  putTask(req, res) {
    assert.notStrictEqual(null, req.body.components)

    assert.notStrictEqual(null, req.body.createdBy)
    assert.notStrictEqual(undefined, req.body.createdBy)
    assert.notStrictEqual('', req.body.createdBy)

    assert.notStrictEqual(null, req.body.taskTypeId)
    assert.notStrictEqual(undefined, req.body.taskTypeId)
    assert.notStrictEqual('', req.body.taskTypeId)

    assert.notStrictEqual(null, req.body.taskTypeName)
    assert.notStrictEqual(undefined, req.body.taskTypeName)
    assert.notStrictEqual('', req.body.taskTypeName)

    if (undefined !== req.body.components) {
      assert(req.body.components instanceof Array && req.body.components.length > 0)
    }

    const task = this._taskBuilder.buildTask({
      components: req.body.components,
      createdBy: req.body.createdBy,
      taskTypeId: req.body.taskTypeId,
      taskTypeName: req.body.taskTypeName
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
          .findOne({ '_id': id })
          .then(function(doc) {
            if (null === doc) {
              res.status(404).send({ status: 'not_found' })
            } else {
              res.send(doc)
            }
          })
      })
  }

  listTasks(req, res) {
    this._mongoClient
      .collection('nest', 'task')
      .then(function (collection) {
        collection.find({}, {}, { sort: { 'data.createdAt': -1 } }).toArray(function(err, docs) {
          assert.strictEqual(null, err)

          res.send(docs)
        })
      })
  }

  register(app) {
    app.put('/api/v1/task', this.putTask.bind(this))
    app.get('/api/v1/task/:id', this.getTask.bind(this))
    app.get('/api/v1/task', this.listTasks.bind(this))
  }
}

export default TaskController