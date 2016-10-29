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
    return new Promise((resolve) => {
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

      this._initServer(data).then((server) => {
        server.start(() => {
          this._logger.info('API service started, listening on port ' + this._taskApiPort)

          resolve(server)
        })
      })
    })
  }
}

export default TaskApiServerService