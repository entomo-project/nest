import Kernel from '../Common/DependencyInjection/Kernel'
import TaskController from '../Front/Controller/TaskController'
import WebServerFactory from '../Common/Service/WebServerFactory'
import MongoClient from '../Common/Service/Mongo/MongoClient'
import requestPromiseFactory from 'request-promise'

class FrontKernel extends Kernel {
  _configureServiceContainer() {
    super._configureServiceContainer()

    this.serviceContainer.setParameter('queue_size', 4)
    this.serviceContainer.setParameter('web_server_port', 3002)
    this.serviceContainer.setParameter('mongo_url', 'mongodb://mongo:27017')

    const mongoClient = new MongoClient(this._serviceContainer.getParameter('mongo_url'))
    this.serviceContainer.set('app.service.mongo.client', mongoClient)

    this.serviceContainer.set('app.service.web_server_factory', WebServerFactory)

    this.serviceContainer.set('app.service.request_promise_factory', requestPromiseFactory)
  }
}

const kernel = new FrontKernel()

kernel.boot()

export default kernel