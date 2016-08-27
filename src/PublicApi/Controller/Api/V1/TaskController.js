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
            res.json({ status: 'success' })
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
              res.status(404).json({ status: 'not_found' })
            } else {
              res.json(doc)
            }
          })
          .done()
      })
      .done()
  }

  listTasks(req, res) {
    const from = req.query.from === undefined ? 0 : parseInt(req.query.from, 10)
    const limit = req.query.limit === undefined ? 10 : parseInt(req.query.limit, 10)
    const q = req.query.q
    const rawSort = req.query.sort
    let sort
    let sortOrder

    if (undefined !== rawSort) {
      if ('asc' === rawSort.order) {
        sortOrder = 1
      } else if ('desc' === rawSort.order) {
        sortOrder = -1
      } else {
        throw new Error(
          'Expecting either order to be either "asc" or "desc", got "' + rawSort.order + '"'
        )
      }

      sort = {
        [rawSort.sort]: sortOrder
      }
    } else {
      //Default sort
      sort = {
        'data.createdAt': -1
      }
    }

    this._mongoClient
      .collection('nest', 'task')
      .then((collection) => {
        let result
        let total
        let filteredTotal
        const query = {}

        if (!(undefined === q || '' === q || null === q)) {
          query['data.taskTypeId'] = {
            $regex: q
          }
        }

        Promise.all(
          [
            collection
              .find(query)
              .sort(sort)
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
              }),
            collection
              .find(query)
              .count()
              .then((iFilteredTotal) => {
                filteredTotal = iFilteredTotal
              })
          ]
        ).then(() => {
          res.json({
            result,
            info: {
              total,
              filteredTotal
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