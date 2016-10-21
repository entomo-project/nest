class TaskApi {
  constructor(taskApiHost, taskApiPort, logger, initServer, taskController) {
    this._taskApiHost = taskApiHost
    this._taskApiPort = taskApiPort
    this._logger = logger
    this._initServer = initServer
    this._taskController = taskController
  }

  start() {
    this._logger.info('Starting webservice app.')

    const routes = []

    this._taskController.register(routes)

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
        console.log('API service started, listening on port ' + this._taskApiPort)
      })
    })
  }
}

export default TaskApi