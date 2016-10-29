import { ObjectID } from 'mongodb'
import Boom from 'boom'
import Joi from 'joi'

class TaskRoutes {
  constructor(mongoClient, taskBuilder) {
    this._mongoClient = mongoClient
    this._taskBuilder = taskBuilder
  }

  createTask(req, res) {
    const payload = req.payload

    const payloadSchemaKeys = {
      components: Joi.array().min(1).items(Joi.string()).required(),
      createdBy: Joi.string().min(1).required(),
      type: Joi.string().min(1).required()
    }

    let startAfter

    const isCommandBased = payload.components.indexOf('commandBased') !== -1
    const hasStartAfter = payload.components.indexOf('startAfter') !== -1

    if (isCommandBased) {
      payloadSchemaKeys.command = Joi.string().min(1).required()
    }

    if (hasStartAfter) {
      payloadSchemaKeys.startAfter = Joi.string().isoDate().required()
    }

    const payloadSchema = Joi.object().keys(payloadSchemaKeys)

    let hadError = false

    Joi.validate(payload, payloadSchema, function (err) {
      if (err) {
        res(Boom.badRequest())

        hadError = true
      }
    })

    if (hadError) {
      return
    }

    if (hasStartAfter) {
      startAfter = new Date(payload.startAfter)
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