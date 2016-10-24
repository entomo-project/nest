import Kernel from '../common/dependency-injection/kernel'
import TaskController from './controller/api/v1/task-controller'
import MongoClient from '../common/service/mongo/mongo-client'
import TaskBuilder from '../common/service/task/task-builder'
import PublicApi from './service/task-api'
import ServiceDefinition from '../common/dependency-injection/service-definition'
import timeService from '../common/service/time'
import config from '../../config'

class TaskApiKernel extends Kernel {
  _configureServiceContainer() {
    super._configureServiceContainer()

    this.serviceContainer.setParameter('app.host', config.taskApi.host)
    this.serviceContainer.setParameter('app.port', config.taskApi.port)
    this.serviceContainer.setParameter('app.mongo_url', config.taskApi.mongoUrl)

    const mongoClient = new MongoClient(
      this._serviceContainer.get('app.service.logger'),
      this._serviceContainer.getParameter('app.mongo_url')
    )

    this.serviceContainer.set('app.service.time', timeService)
    this.serviceContainer.set('app.service.mongo.client', mongoClient)

    const taskBuilder = new TaskBuilder(
      this.serviceContainer.get('app.service.time')
    )
    this.serviceContainer.set('app.service.task.builder', taskBuilder)

    const taskController = new TaskController(
      this.serviceContainer.get('app.service.mongo.client'),
      this.serviceContainer.get('app.service.task.builder')
    )

    this.serviceContainer.set('app.controller.api.v1.task', taskController)

    this.serviceContainer.setDefinition(
      'app.service.task_api',
      new ServiceDefinition(
        (container) => {
          return new PublicApi(
            container.getParameter('app.host'),
            container.getParameter('app.port'),
            container.get('app.service.logger'),
            container.get('app.service.init_server'),
            container.get('app.controller.api.v1.task')
          )
        }
      )
    )
  }
}

const kernel = new TaskApiKernel()

kernel.boot()

export default kernel