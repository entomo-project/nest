import initServer from '@bmichalski/basic-hapi-api-server'
import Promise from 'bluebird'

class WorkerServerService {
  constructor(
    workerHost,
    workerPort,
    logger,
    doRoutes
  ) {
    this._workerHost = workerHost
    this._workerPort = workerPort
    this._logger = logger
    this._doRoutes = doRoutes
  }

  start() {
    const routes = []
    const events = []

    this._doRoutes.register(routes, events)

    return new Promise((resolve) => {
      initServer({
        api: {
          name: 'Worker service',
          version: '1',
          hasDocumentation: true,
          routes: routes
        },
        server: {
          connections: [
            {
              host: this._workerHost,
              port: this._workerPort
            }
          ]
        }
      }).then((server) => {
        this._server = server

        events.forEach((event) => {
          server.event(event)
        })

        this._doRoutes.emit = server.emit.bind(server)

        server.start(() => {
          this._logger.info('Worker service started, listening on port ' + this._workerPort)
        })

        resolve(server)
      })
    })
  }
}

export default WorkerServerService