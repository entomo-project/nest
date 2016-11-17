export default {
  services: {
    'app.service.spawn': {
      factory: '@app.service.spawn_factory'
    },
    'app.service.scheduler_notifier': {
      class: 'scheduler_notifier',
      args: [
        '@app.service.logger',
        '@app.service.request_promise'
      ]
    },
    'app.service.shell_command_runner': {
      class: 'shell_command_runner',
      args: [
        '@app.service.spawn'
      ]
    },
    'app.service.sandbox': {
      class: 'sandbox_service',
      args: [
        '@app.service.vm',
        '@app.service.shell_command_runner'
      ]
    },
    'app.service.server_service.routes.api.do': {
      class: 'do_routes',
      args: [
        '@app.service.logger',
        '@app.service.sandbox',
        '@app.service.scheduler_notifier',
        '%app.scheduler.base_url'
      ]
    },
    'app.service.server': {
      class: 'worker_service',
      args: [
        '%app.service.host',
        '%app.service.port',
        '@app.service.logger',
        '@app.service.server_service.routes.api.do'
      ]
    }
  }
}
