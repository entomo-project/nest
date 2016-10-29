import Kernel from '../common/dependency-injection/kernel'
import TaskRoutes from './service/server-service/routes/api/task-routes'
import MongoClient from '../common/service/mongo/mongo-client'
import TaskBuilder from '../common/service/task/task-builder'
import PublicApi from './service/server-service'
import ServiceDefinition from '../common/dependency-injection/service-definition'
import config from '../../config'

class TaskApiKernel extends Kernel {
  _configureServiceContainer() {
    super._configureServiceContainer()

    this.serviceContainer.setParameter('app.host', config.taskApi.host)
    this.serviceContainer.setParameter('app.port', config.taskApi.port)
    this.serviceContainer.setParameter('app.mongo_url', config.taskApi.mongoUrl)

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
      'app.service.task.builder',
      new ServiceDefinition((container) => {
        return new TaskBuilder(
          container.get('app.service.time')
        )
      })
    )

    this.serviceContainer.setDefinition(
      'app.service.server_service.routes.api.task',
      new ServiceDefinition((container) => {
        return new TaskRoutes(
          container.get('app.service.mongo.client'),
          container.get('app.service.task.builder')
        )
      })
    )

    this.serviceContainer.setDefinition(
      'app.service.server',
      new ServiceDefinition(
        (container) => {
          return new PublicApi(
            container.getParameter('app.host'),
            container.getParameter('app.port'),
            container.get('app.service.logger'),
            container.get('app.service.init_server'),
            container.get('app.service.server_service.routes.api.task')
          )
        }
      )
    )
  }
}

export default TaskApiKernel