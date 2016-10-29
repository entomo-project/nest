import Promise from 'bluebird'

class TaskApiServerService {
  constructor(
    taskApiHost,
    taskApiPort,
    logger,
    initServer,
    taskRoutes
  ) {
    this._taskApiHost = taskApiHost
    this._taskApiPort = taskApiPort
    this._logger = logger
    this._initServer = initServer
    this._taskRoutes = taskRoutes
  }

  start() {
    this._logger.info('Starting webservice app.')

    const routes = []

    this._taskRoutes.register(routes)

    const data = {
      api: {
        name: 'API service',
        version: '1',
        hasDocumentation: true,
        routes: routes
      },
      server: {
        connections: [
          {
            host: this._taskApiHost,
            port: this._taskApiPort
          }
        ]
      }
    }

    return this._initServer(data).then((server) => {
      return new Promise((resolve) => {
        server.start(() => {
          this._logger.info('API service started, listening on port ' + this._taskApiPort)

          return resolve(server)
        })
      })
    })
  }
}

export default TaskApiServerService