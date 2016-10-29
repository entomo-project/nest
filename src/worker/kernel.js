import Kernel from '../common/dependency-injection/kernel'
import WorkerService from './service/worker-service'
import ServiceDefinition from '../common/dependency-injection/service-definition'
import config from '../../config'
import SchedulerNotifier from './service/scheduler-notifier'
import ShellCommandRunner from './service/shell-command-runner'
import SandboxService from './service/sandbox-service'

class WorkerKernel extends Kernel {
  _configureServiceContainer() {
    super._configureServiceContainer()

    this.serviceContainer.setParameter('app.service.host', config.worker.host)
    this.serviceContainer.setParameter('app.service.port', config.worker.port)
    this.serviceContainer.setParameter('app.scheduler.base_url', config.worker.scheduler.baseUrl)

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
      new ServiceDefinition((container) => {
        return new SchedulerNotifier(
          container.get('app.service.logger'),
          container.get('app.service.request_promise')
        )
      })
    )
    this.serviceContainer.setDefinition(
      'app.service.shell_command_runner',
      new ServiceDefinition((container) => {
        return new ShellCommandRunner(
          container.get('app.service.spawn')
        )
      })
    )
    this.serviceContainer.setDefinition(
      'app.service.sandbox',
      new ServiceDefinition((container) => {
        return new SandboxService(
          container.get('app.service.vm'),
          container.get('app.service.shell_command_runner')
        )
      })
    )
    this.serviceContainer.setDefinition(
      'app.service.server',
      new ServiceDefinition(
        (container) => {
          return new WorkerService(
            container.getParameter('app.service.host'),
            container.getParameter('app.service.port'),
            container.get('app.service.logger'),
            container.get('app.service.sandbox'),
            container.get('app.service.scheduler_notifier'),
            container.getParameter('app.scheduler.base_url')
          )
        }
      )
    )
  }
}

export default WorkerKernel