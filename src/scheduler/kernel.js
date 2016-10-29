import Kernel from '../common/dependency-injection/kernel'
import ServiceDefinition from '../common/dependency-injection/service-definition'
import MongoClient from '../common/service/mongo/mongo-client'
import SchedulerService from './service/server-service'
import config from '../../config'
import WorkerNotifier from './service/worker-notifier'

class SchedulerKernel extends Kernel {
  _configureServiceContainer() {
    super._configureServiceContainer()

    this.serviceContainer.setParameter('app.host', config.scheduler.host)
    this.serviceContainer.setParameter('app.port', config.scheduler.port)
    this.serviceContainer.setParameter('app.queue_size', config.scheduler.queueSize)
    this.serviceContainer.setParameter('app.mongo_url', config.scheduler.mongoUrl)
    this.serviceContainer.setParameter('app.workers', config.scheduler.workers)

    this.serviceContainer.setDefinition(
      'app.service.mongo.client',
      new ServiceDefinition((container) => {
        return new MongoClient(
          container.get('app.service.logger'),
          container.getParameter('app.mongo_url')
        )
      })
    )

    this.serviceContainer.setDefinition(
      'app.service.request_promise_factory',
      new ServiceDefinition(() => {
        return require('request-promise')
      })
    )

    this.serviceContainer.setDefinition(
      'app.service.worker_notifier',
      new ServiceDefinition(
        (container) => {
          return new WorkerNotifier(
            container.get('app.service.logger'),
            container.get('app.service.request_promise_factory')
          )
        }
      )
    )

    this.serviceContainer.setDefinition(
      'app.service.server',
      new ServiceDefinition(
        (container) => {
          return new SchedulerService(
            container.getParameter('app.host'),
            container.getParameter('app.port'),
            container.get('app.service.logger'),
            container.get('app.service.mongo.client'),
            container.get('app.service.time'),
            container.getParameter('app.queue_size'),
            container.get('app.service.worker_notifier'),
            container.getParameter('app.workers')
          )
        }
      )
    )
  }
}

export default SchedulerKernel