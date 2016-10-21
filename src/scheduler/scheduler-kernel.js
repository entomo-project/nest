import Kernel from '../common/dependency-injection/kernel'
import ServiceDefinition from '../common/dependency-injection/service-definition'
import MongoClient from '../common/service/mongo/mongo-client'
import requestPromiseFactory from 'request-promise'
import SchedulerService from './service/scheduler-service'
import config from '../../config'

class FrontKernel extends Kernel {
  _configureServiceContainer() {
    super._configureServiceContainer()

    this.serviceContainer.setParameter('app.host', config.scheduler.host)
    this.serviceContainer.setParameter('app.port', config.scheduler.port)
    this.serviceContainer.setParameter('app.queue_size', config.scheduler.queueSize)
    this.serviceContainer.setParameter('app.mongo_url', config.scheduler.mongoUrl)
    this.serviceContainer.setParameter('app.worker.base_url', config.scheduler.worker.baseUrl)

    const mongoClient = new MongoClient(
      this._serviceContainer.get('app.service.logger'),
      this._serviceContainer.getParameter('app.mongo_url')
    )

    this.serviceContainer.set('app.service.mongo.client', mongoClient)
    this.serviceContainer.set('app.service.request_promise_factory', requestPromiseFactory)

    this.serviceContainer.setDefinition(
      'app.service.scheduler',
      new ServiceDefinition(
        (container) => {
          return new SchedulerService(
            container.getParameter('app.host'),
            container.getParameter('app.port'),
            container.get('app.service.logger'),
            container.get('app.service.mongo.client'),
            container.get('app.service.request_promise_factory'),
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