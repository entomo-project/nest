export default {
  services: {
    'app.service.worker_notifier': {
      class: 'worker_notifier',
      args: [
        '@app.service.logger',
        '@app.service.request_promise'
      ]
    },
    'app.service.task.task_builder': {
      class: 'task_builder',
      args: [
        '@app.service.time'
      ]
    },
    'app.service.server.routes.api.task': {
      class: 'server_routes_api_task',
      args: [
        '@app.service.task.task_builder',
        '@app.service.mongo.collection.task'
      ]
    },
    'app.service.server': {
      class: 'scheduler_service',
      args: [
        '%app.host',
        '%app.https',
        '@app.service.logger',
        '@app.service.time',
        '@app.service.server.routes.api.task',
        '%app.queue_size',
        '@app.service.worker_notifier',
        '%app.workers',
        '@app.service.mongo.collection.task'
      ]
    },
    'app.service.mongo.db': {
      factory: '@app.service.factory.mongo.db',
      args: [
        '%app.mongo'
      ]
    },
    'app.service.mongo.collection.task': {
      factory: '@app.service.factory.mongo.collection.task',
      args: [
        '@app.service.mongo.db'
      ]
    }
  }
}
