import { exec } from 'child_process'
import vm from 'vm'
import requestPromiseFactory from 'request-promise'
import Kernel from '../Common/DependencyInjection/Kernel'
import WebServerFactory from '../Common/Service/WebServerFactory'
import WorkerService from './Service/WorkerService'

class WorkerKernel extends Kernel {
  _configureServiceContainer() {
    super._configureServiceContainer()

    this.serviceContainer.setParameter('web_server_port', 3003)

    this.serviceContainer.set('app.service.vm', vm)
    this.serviceContainer.set('app.service.exec', exec)
    this.serviceContainer.set('app.service.request_promise_factory', requestPromiseFactory)
    this.serviceContainer.set('app.service.web_server_factory', WebServerFactory)

    const workerService = new WorkerService(
      this.serviceContainer.get('app.logger'),
      this.serviceContainer.get('app.service.exec'),
      this.serviceContainer.get('app.service.web_server_factory'),
      this.serviceContainer.get('app.service.request_promise_factory'),
      this.serviceContainer.get('app.service.vm'),
      this.serviceContainer.getParameter('web_server_port')
    )

    this.serviceContainer.set('app.service.worker', workerService)
  }
}

const kernel = new WorkerKernel()

kernel.boot()

export default kernel