import { spawn } from 'child_process'
import vm from 'vm'
import requestPromiseFactory from 'request-promise'
import Kernel from '../Common/DependencyInjection/Kernel'
import WebServerFactory from '../Common/Service/WebServerFactory'
import WorkerService from './Service/WorkerService'
import ServiceDefinition from '../Common/DependencyInjection/ServiceDefinition'

class WorkerKernel extends Kernel {
  _configureServiceContainer() {
    super._configureServiceContainer()

    this.serviceContainer.set('app.service.vm', vm)
    this.serviceContainer.set('app.service.spawn', spawn)
    this.serviceContainer.set('app.service.request_promise_factory', requestPromiseFactory)
    this.serviceContainer.set('app.service.web_server_factory', WebServerFactory)

    this.serviceContainer.setDefinition(
      'app.service.worker',
      new ServiceDefinition(
        (container) => {
          return new WorkerService(
            container.get('app.service.logger'),
            container.get('app.service.spawn'),
            container.get('app.service.web_server_factory'),
            container.get('app.service.request_promise_factory'),
            container.get('app.service.vm'),
            container.getParameter('app.web_servers')
          )
        }
      )
    )
  }
}

const kernel = new WorkerKernel()

kernel.boot()

export default kernel