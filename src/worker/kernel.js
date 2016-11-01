import Kernel from '../common/dependency-injection/kernel'
import WorkerService from './service/server-service'
import ServiceDefinition from '../common/dependency-injection/service-definition'
import SchedulerNotifier from './service/scheduler-notifier'
import ShellCommandRunner from './service/shell-command-runner'
import SandboxService from './service/sandbox-service'
import DoRoutes from './service/server-service/routes/api/do-routes'

class WorkerKernel extends Kernel {
  _configureServiceContainer(conf) {
    super._configureServiceContainer()

    this.serviceContainer.setParameter('app.service.host', conf.worker.host)
    this.serviceContainer.setParameter('app.service.port', conf.worker.port)
    this.serviceContainer.setParameter('app.scheduler.base_url', conf.worker.scheduler.baseUrl)

    this.serviceContainer.setDefinition(
      'app.service.vm',
      new ServiceDefinition(() => {
        return require('vm')
      })
    )
    this.serviceContainer.setDefinition(
      'app.service.spawn',
      new ServiceDefinition(() => {
        return require('child_process').spawn
      })
    )
    this.serviceContainer.setDefinition(
      'app.service.request_promise',
      new ServiceDefinition(() => {
        return require('request-promise')
      })
    )
    this.serviceContainer.setDefinition(
      'app.service.scheduler_notifier',
      (container) => {
        return [
          SchedulerNotifier,
          container.get('app.service.logger'),
          container.get('app.service.request_promise')
        ]
      }
    )
    this.serviceContainer.setDefinition(
      'app.service.shell_command_runner',
      (container) => {
        return [
          ShellCommandRunner,
          container.get('app.service.spawn')
        ]
      }
    )
    this.serviceContainer.setDefinition(
      'app.service.sandbox',
      (container) => {
        return [
          SandboxService,
          container.get('app.service.vm'),
          container.get('app.service.shell_command_runner')
        ]
      }
    )
    this.serviceContainer.setDefinition(
      'app.service.server_service.routes.api.do',
      (container) => {
        return [
          DoRoutes,
          container.get('app.service.logger'),
          container.get('app.service.sandbox'),
          container.get('app.service.scheduler_notifier'),
          container.getParameter('app.scheduler.base_url')
        ]
      }
    )
    this.serviceContainer.setDefinition(
      'app.service.server',
      (container) => {
        return [
          WorkerService,
          container.getParameter('app.service.host'),
          container.getParameter('app.service.port'),
          container.get('app.service.logger'),
          container.get('app.service.server_service.routes.api.do')
        ]
      }
    )
  }
}

export default WorkerKernel