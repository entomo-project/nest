import Kernel from '../Common/DependencyInjection/Kernel'
import TaskController from './Controller/TaskController'
import WebServerFactory from '../Common/Service/WebServerFactory'
import FrontApp from './Service/FrontApp'
import ServiceDefinition from '../Common/DependencyInjection/ServiceDefinition'

class FrontKernel extends Kernel {
  _configureServiceContainer() {
    super._configureServiceContainer()

    this.serviceContainer.set('app.service.web_server_factory', WebServerFactory)

    const taskController = new TaskController()

    this.serviceContainer.set('app.controller.task', taskController)

    this.serviceContainer.setDefinition(
      'app.service.front_app',
      new ServiceDefinition(
        (container) => {
          return new FrontApp(
            container.get('app.service.logger'),
            container.get('app.service.web_server_factory'),
            container.get('app.controller.task'),
            container.getParameter('app.web_servers')
          )
        }
      )
    )
  }
}

const kernel = new FrontKernel()

kernel.boot()

export default kernel