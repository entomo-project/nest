import {ObjectLoader} from '@bmichalski/disl'

import Kernel from '../common/kernel'

class WorkerKernel extends Kernel {
  _configureServiceContainer(conf) {
    super._configureServiceContainer()

    this.serviceContainer.setParameter('app.service.host', conf.worker.host)
    this.serviceContainer.setParameter('app.service.port', conf.worker.port)
    this.serviceContainer.setParameter('app.scheduler.base_url', conf.worker.scheduler.baseUrl)

    const assoc = {
      'app.service.vm': 'vm',
      'app.service.spawn_factory': '../common/service/factory/spawn'
    }

    const classAssoc = {
      worker_service: './service/server-service',
      scheduler_notifier: './service/scheduler-notifier',
      shell_command_runner: './service/shell-command-runner',
      sandbox_service: './service/sandbox-service',
      do_routes: './service/server-service/routes/api/do-routes'
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

    const loader = new ObjectLoader(this.serviceContainer)

    loader.load(require('./services').default)
  }
}

export default WorkerKernel