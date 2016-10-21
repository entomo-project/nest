import { spawn } from 'child_process'
import vm from 'vm'
import requestPromiseFactory from 'request-promise'
import Kernel from '../common/dependency-injection/kernel'
import WorkerService from './service/worker-service'
import ServiceDefinition from '../common/dependency-injection/service-definition'
import config from '../../config'

class WorkerKernel extends Kernel {
  _configureServiceContainer() {
    super._configureServiceContainer()

    this.serviceContainer.set('app.service.host', config.worker.host)
    this.serviceContainer.set('app.service.port', config.worker.port)
    this.serviceContainer.set('app.service.vm', vm)
    this.serviceContainer.set('app.service.spawn', spawn)
    this.serviceContainer.set('app.service.request_promise_factory', requestPromiseFactory)
    this.serviceContainer.setParameter('app.scheduler.base_url', config.worker.scheduler.baseUrl)

    this.serviceContainer.setDefinition(
      'app.service.worker',
      new ServiceDefinition(
        (container) => {
          return new WorkerService(
            container.get('app.service.host'),
            container.get('app.service.port'),
            container.get('app.service.logger'),
            container.get('app.service.spawn'),
            container.get('app.service.request_promise_factory'),
            container.get('app.service.vm'),
            container.getParameter('app.scheduler.base_url')
          )
        }
      )
    )
  }
}

const kernel = new WorkerKernel()

kernel.boot()

export default kernel