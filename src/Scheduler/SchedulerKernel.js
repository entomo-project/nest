import Kernel from '../Common/DependencyInjection/Kernel'
import ServiceDefinition from '../Common/DependencyInjection/ServiceDefinition'
import WebServerFactory from '../Common/Service/WebServerFactory'
import MongoClient from '../Common/Service/Mongo/MongoClient'
import requestPromiseFactory from 'request-promise'
import SchedulerService from './Service/SchedulerService'

class FrontKernel extends Kernel {
  _configureServiceContainer() {
    super._configureServiceContainer()

    this.serviceContainer.setParameter('queue_size', 4)
    this.serviceContainer.setParameter('mongo_url', 'mongodb://mongo:27017')

    const mongoClient = new MongoClient(
      this._serviceContainer.get('app.service.logger'),
      this._serviceContainer.getParameter('mongo_url')
    )
    this.serviceContainer.set('app.service.mongo.client', mongoClient)

    this.serviceContainer.set('app.service.web_server_factory', WebServerFactory)

    this.serviceContainer.set('app.service.request_promise_factory', requestPromiseFactory)

    this.serviceContainer.setDefinition(
      'app.service.scheduler',
      new ServiceDefinition(
        (container) => {
          return new SchedulerService(
            container.get('app.service.logger'),
            container.get('app.service.mongo.client'),
            container.get('app.service.request_promise_factory'),
            container.get('app.service.web_server_factory'),
            container.getParameter('app.web_servers'),
            container.getParameter('queue_size')
          )
        }
      )
    )
  }
}

const kernel = new FrontKernel()

kernel.boot()

export default kernel