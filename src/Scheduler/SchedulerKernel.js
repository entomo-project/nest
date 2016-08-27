import Kernel from '../Common/DependencyInjection/Kernel'
import ServiceDefinition from '../Common/DependencyInjection/ServiceDefinition'
import WebServerFactory from '../Common/Service/WebServerFactory'
import MongoClient from '../Common/Service/Mongo/MongoClient'
import requestPromiseFactory from 'request-promise'
import SchedulerService from './Service/SchedulerService'
import config from '../../config'

class FrontKernel extends Kernel {
  _configureServiceContainer() {
    super._configureServiceContainer()

    this.serviceContainer.setParameter('app.queue_size', config.scheduler.queueSize)
    this.serviceContainer.setParameter('app.mongo_url', config.scheduler.mongoUrl)
    this.serviceContainer.setParameter('app.worker.base_url', config.scheduler.worker.baseUrl)

    const mongoClient = new MongoClient(
      this._serviceContainer.get('app.service.logger'),
      this._serviceContainer.getParameter('app.mongo_url')
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
            container.getParameter('app.queue_size'),
            container.getParameter('app.worker.base_url')
          )
        }
      )
    )
  }
}

const kernel = new FrontKernel()

kernel.boot()

export default kernel