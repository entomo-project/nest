import Kernel from '../Common/DependencyInjection/Kernel'
import TaskController from './Controller/Api/V1/TaskController'
import MongoClient from '../Common/Service/Mongo/MongoClient'
import TaskBuilder from '../Common/Service/Task/TaskBuilder'
import WebServerFactory from '../Common/Service/WebServerFactory'
import PublicApi from './Service/PublicApi'
import ServiceDefinition from '../Common/DependencyInjection/ServiceDefinition'
import config from '../../config'

class PublicApiKernel extends Kernel {
  _configureServiceContainer() {
    super._configureServiceContainer()

    this.serviceContainer.setParameter('app.mongo_url', config.publicApi.mongoUrl)
    this.serviceContainer.setParameter('app.allowed_origins', config.publicApi.allowedOrigins)

    const mongoClient = new MongoClient(
      this._serviceContainer.get('app.service.logger'),
      this._serviceContainer.getParameter('app.mongo_url')
    )

    this.serviceContainer.set('app.service.mongo.client', mongoClient)

    const taskBuilder = new TaskBuilder()
    this.serviceContainer.set('app.service.task.builder', taskBuilder)

    this.serviceContainer.set('app.service.web_server_factory', WebServerFactory)

    const taskController = new TaskController(
      this.serviceContainer.get('app.service.mongo.client'),
      this.serviceContainer.get('app.service.task.builder')
    )

    this.serviceContainer.set('app.controller.api.v1.task', taskController)

    this.serviceContainer.setDefinition(
      'app.service.public_api',
      new ServiceDefinition(
        (container) => {
          return new PublicApi(
            container.get('app.service.logger'),
            container.get('app.service.web_server_factory'),
            container.get('app.controller.api.v1.task'),
            container.getParameter('app.web_servers'),
            container.getParameter('app.allowed_origins')
          )
        }
      )
    )
  }
}

const kernel = new PublicApiKernel()

kernel.boot()

export default kernel