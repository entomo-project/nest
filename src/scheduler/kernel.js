import {ObjectLoader} from '@bmichalski/disl'

import Kernel from '../common/kernel'

class SchedulerKernel extends Kernel {
  _configureServiceContainer(conf) {
    super._configureServiceContainer()

    this.serviceContainer.setParameter('app.host', conf.scheduler.host)
    this.serviceContainer.setParameter('app.https', conf.scheduler.https)
    this.serviceContainer.setParameter('app.queue_size', conf.scheduler.queueSize)
    this.serviceContainer.setParameter('app.mongo', conf.scheduler.mongo)
    this.serviceContainer.setParameter('app.workers', conf.scheduler.workers)

    const assoc = {
      'app.service.factory.mongo.db': '../common/service/factory/mongo/db',
      'app.service.factory.mongo.collection.task': '../common/service/factory/mongo/collection/task'
    }

    const classAssoc = {
      'worker_notifier': './service/worker-notifier',
      'scheduler_service': './service/server-service',
      'server_routes_api_task': './service/server-service/routes/api/task-routes',
      'task_builder': '../common/service/task/task-builder'
    }

    this.serviceContainer.registerInstanceLocator((identifier) => {
      if (undefined === assoc[identifier]) {
        return
      }

      const moduleName = assoc[identifier]

      const module = require(moduleName)

      if (undefined !== module.default) {
        return module.default
      }

      return module
    })

    this.serviceContainer.registerClassLocator((identifier) => {
      if (undefined === classAssoc[identifier]) {
        return
      }

      const moduleName = classAssoc[identifier]

      const module = require(moduleName)

      if (undefined !== module.default) {
        return module.default
      }

      return module
    })

    const loader = new ObjectLoader(this._serviceContainer)

    loader.load(require('./services').default)
  }
}

export default SchedulerKernel