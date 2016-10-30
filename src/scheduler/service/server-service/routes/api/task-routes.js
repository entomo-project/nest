import { ObjectID } from 'mongodb'
import Boom from 'boom'
import Joi from 'joi'
import _ from 'lodash'

class TaskRoutes {
  constructor(taskBuilder, taskCollection) {
    this._taskBuilder = taskBuilder
    this._taskCollection = taskCollection
  }

  createTask(req, res) {
    const payload = req.payload

    const components = _.get(payload, 'meta.components', [])

    const isCommandBased = components.indexOf('commandBased') !== -1
    const hasStartAfter = components.indexOf('startAfter') !== -1

    function isValid(what, schema) {
      let hadError = false

      Joi.validate(what, schema, function (err) {
        if (err) {
          hadError = true
        }
      })

      return !hadError
    }

    const schema = {
      meta: Joi.object().required().keys({
        components: Joi.array().min(1).items(Joi.string()).required()
      }),
      data: {
        base: Joi.object().required().keys({
          type: Joi.string().min(1).required(),
          createdBy: Joi.string().min(1).required()
        })
      }
    }

    if (isCommandBased) {
      _.set(schema.data, 'commandBased.command', Joi.string().min(1).required())
    }

    if (hasStartAfter) {
      _.set(schema.data, 'startAfter.startAfter', Joi.string().isoDate().required())
    }

    if (!isValid(payload, schema)) {
      return res(Boom.badRequest())
    }

    let startAfter

    if (hasStartAfter) {
      startAfter = new Date(payload.data.startAfter.startAfter)
    }

    const rawTask = this._taskBuilder.buildTask(payload)

    this._taskCollection
      .then((taskCollection) => {
        taskCollection.insertOne(rawTask)
          .then(() => {
            res({ status: 'success' })
          })
      })
  }

  retrieveTask(req, res) {
    const objectId = ObjectID(req.params.id)

    this._taskCollection
      .then((taskCollection) => {
        taskCollection
          .findOne({ '_id': objectId })
          .then((doc) => {
            if (null === doc) {
              return res(Boom.notFound())
            }

            return res({ result: doc })
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
      handler: this.retrieveTask.bind(this),
      config: {
        validate: {
          params: {
            id: Joi.string().regex(/^[0-9a-fA-F]{24}$/)
          }
        }
      }
    })
  }
}

export default TaskRoutes