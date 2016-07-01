import Kernel from 'Common/DependencyInjection/Kernel'
import TaskController from './Front/Controller/TaskController'
import WebServerFactory from 'Common/Service/WebServerFactory'

class FrontKernel extends Kernel {
  _configureServiceContainer() {
    super._configureServiceContainer()

    this.serviceContainer.setParameter('web_server_port', 3002)

    this.serviceContainer.set('app.service.web_server_factory', WebServerFactory)
  }
}

const kernel = new FrontKernel()

kernel.boot()

export default kernel