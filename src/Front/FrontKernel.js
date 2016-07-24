import Kernel from '../Common/DependencyInjection/Kernel'
import TaskController from './Controller/TaskController'
import WebServerFactory from '../Common/Service/WebServerFactory'

class FrontKernel extends Kernel {
  _configureServiceContainer() {
    super._configureServiceContainer()

    this.serviceContainer.setParameter(
      'web_servers',
      [
        {
          hostname: 'localhost',
          port: 3001
        },
        {
          hostname: '172.17.0.3',
          port: 3001
        }
      ]
    )

    this.serviceContainer.set('app.service.web_server_factory', WebServerFactory)

    const taskController = new TaskController()

    this.serviceContainer.set('app.controller.task', taskController)
  }
}

const kernel = new FrontKernel()

kernel.boot()

export default kernel