import assert from 'assert'
import { ObjectID } from 'mongodb'
import Promise from 'bluebird'
import Boom from 'boom'

class TaskController{
  constructor(mongoClient, taskBuilder) {
    this._mongoClient = mongoClient
    this._taskBuilder = taskBuilder
  }

  createTask(req, res) {
    const payload = req.payload

    assert.notStrictEqual(null, payload.components, 'Missing components.')

    assert.notStrictEqual(null, payload.createdBy, 'Missing createdBy.')
    assert.notStrictEqual(undefined, payload.createdBy, 'Missing createdBy.')
    assert.notStrictEqual('', payload.createdBy, 'Missing createdBy.')

    assert.notStrictEqual(null, payload.type, 'Missing type.')
    assert.notStrictEqual(undefined, payload.type, 'Missing type.')
    assert.notStrictEqual('', payload.type, 'Missing type.')

    let startAfter = undefined

    if (undefined !== payload.components) {
      assert(payload.components instanceof Array, 'Expecting components to be array.')
      assert(payload.components.length > 0, 'Empty components.')

      if (payload.components.indexOf('commandBased') !== -1) {
        assert.notStrictEqual(null, payload.command, 'Missing command.')
        assert.notStrictEqual(undefined, payload.command, 'Missing command.')
        assert.notStrictEqual('', payload.command, 'Missing command.')
      }

      if (payload.components.indexOf('startAfter') !== -1) {
        assert.notStrictEqual(null, payload.startAfter, 'Missing startAfter.')
        assert.notStrictEqual(undefined, payload.startAfter, 'Missing startAfter.')
        assert.notStrictEqual('', payload.startAfter, 'Missing startAfter.')

        startAfter = new Date(payload.startAfter)

        assert(
          !isNaN(startAfter.getTime()),
          'Invalid startAfter "' + payload.startAfter + '".'
        )
      }
    }

    const task = this._taskBuilder.buildTask({
      components: payload.components,
      createdBy: payload.createdBy,
      type: payload.type,
      command: payload.command,
      startAfter
    })

    this._mongoClient
      .collection('nest', 'task')
      .then((collection) => {
        collection
          .insertOne(task)
          .then(() => {
            res({ status: 'success' })
          })
      })
  }

  retrieveTask(req, res) {
    const objectId = ObjectID(req.params.id)

    this._mongoClient
      .collection('nest', 'task')
      .then((collection) => {
        collection
          .find({ '_id': objectId })
          .limit(1)
          .next()
          .then((doc) => {
            if (null === doc) {
              res(Boom.notFound())
            } else {
              res({ result: doc })
            }
          })
      })
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
          query['data.type'] = {
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
          res({
            result,
            info: {
              total,
              filteredTotal
            }
          })
        })
      })
  }

  register(routes) {
    routes.push({
      method: 'POST',
      path:'/api/task',
      handler: this.createTask.bind(this)
    })

    routes.push({
      method: 'GET',
      path:'/api/task/{id}',
      handler: this.retrieveTask.bind(this)
    })

    routes.push({
      method: 'GET',
      path:'/api/task',
      handler: this.listTasks.bind(this)
    })
  }
}

export default TaskController