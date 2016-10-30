import Kernel from '../common/dependency-injection/kernel'
import ServiceDefinition from '../common/dependency-injection/service-definition'
import SchedulerService from './service/server-service'
import config from '../../config'
import WorkerNotifier from './service/worker-notifier'
import TaskRoutes from './service/server-service/routes/api/task-routes'
import TaskBuilder from '../common/service/task/task-builder'
import connect from '../mongo/connect'

class SchedulerKernel extends Kernel {
  _configureServiceContainer() {
    super._configureServiceContainer()

    this.serviceContainer.setParameter('app.host', config.scheduler.host)
    this.serviceContainer.setParameter('app.port', config.scheduler.port)
    this.serviceContainer.setParameter('app.queue_size', config.scheduler.queueSize)
    this.serviceContainer.setParameter('app.mongo', config.scheduler.mongo)
    this.serviceContainer.setParameter('app.workers', config.scheduler.workers)

    this.serviceContainer.setDefinition(
      'app.service.request_promise_factory',
      new ServiceDefinition(() => {
        return require('request-promise')
      })
    )

    this.serviceContainer.setDefinition(
      'app.service.worker_notifier',
      (container) => {
        return [
          WorkerNotifier,
          container.get('app.service.logger'),
          container.get('app.service.request_promise_factory')
        ]
      }
    )

    this.serviceContainer.setDefinition(
      'app.service.task.task_builder',
      (container) => {
        return [
          TaskBuilder,
          container.get('app.service.time')
        ]
      }
    )

    this.serviceContainer.setDefinition(
      'app.service.mongo.collection.task',
      new ServiceDefinition(
        (container) => {
          return container.get('app.service.mongo.connection').then((db) => {
            return db.collection('task')
          })
        }
      )
    )

    this.serviceContainer.setDefinition(
      'app.service.server.routes.api.task',
      (container) => {
        return [
          TaskRoutes,
          container.get('app.service.task.task_builder'),
          container.get('app.service.mongo.collection.task')
        ]
      }
    )

    this.serviceContainer.setDefinition(
      'app.service.mongo.connection',
      new ServiceDefinition(
        (container) => {
          return connect(
            container.getParameter('app.mongo')
          )
        }
      )
    )

    this.serviceContainer.setDefinition(
      'app.service.server',
      (container) => {
        return [
          SchedulerService,
          container.getParameter('app.host'),
          container.getParameter('app.port'),
          container.get('app.service.logger'),
          container.get('app.service.time'),
          container.get('app.service.server.routes.api.task'),
          container.getParameter('app.queue_size'),
          container.get('app.service.worker_notifier'),
          container.getParameter('app.workers'),
          container.get('app.service.mongo.collection.task')
        ]
      }
    )
  }
}

export default SchedulerKernel