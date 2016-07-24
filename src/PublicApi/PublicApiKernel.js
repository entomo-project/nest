import Kernel from '../Common/DependencyInjection/Kernel'
import TaskController from './Controller/Api/V1/TaskController'
import MongoClient from '../Common/Service/Mongo/MongoClient'
import TaskBuilder from '../Common/Service/Task/TaskBuilder'
import WebServerFactory from '../Common/Service/WebServerFactory'

class PublicApiKernel extends Kernel {
  _configureServiceContainer() {
    super._configureServiceContainer()

    this.serviceContainer.setParameter('mongo_url', 'mongodb://mongo:27017')
    this.serviceContainer.setParameter(
      'web_servers',
      [
        {
          hostname: 'localhost',
          port: 3000
        },
        {
          hostname: '172.17.0.3',
          port: 3000
        }
      ]
    )

    const mongoClient = new MongoClient(this._serviceContainer.getParameter('mongo_url'))
    this.serviceContainer.set('app.service.mongo.client', mongoClient)

    const taskBuilder = new TaskBuilder()
    this.serviceContainer.set('app.service.task.builder', taskBuilder)

    this.serviceContainer.set('app.service.web_server_factory', WebServerFactory)

    const taskController = new TaskController(
      this.serviceContainer.get('app.service.mongo.client'),
      this.serviceContainer.get('app.service.task.builder')
    )

    this.serviceContainer.set('app.controller.api.v1.task', taskController)
  }
}

const kernel = new PublicApiKernel()

kernel.boot()

export default kernel