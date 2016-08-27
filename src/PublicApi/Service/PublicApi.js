class PublicApi {
  constructor(logger, webServerFactory, taskController, webServers, allowedOrigins) {
    this._logger = logger
    this._webServerFactory = webServerFactory
    this._taskController = taskController
    this._webServers = webServers

    this._allowedOrigins = {}

    allowedOrigins.forEach((allowedOrigin) => {
      this._allowedOrigins[allowedOrigin] = allowedOrigin
    })
  }

  start() {
    this._logger.info('Starting webservice app.')

    const app = this._webServerFactory()

    const allowedOrigins = this._allowedOrigins

    app.use((req, res, next) => {
      res.set('Access-Control-Allow-Headers', 'Origin')

      const origin = req.get('origin')

      if (undefined !== allowedOrigins[origin]) {
        res.set('Access-Control-Allow-Origin', origin)
      }

      next()
    })

    this._taskController.register(app)

    this._webServers.forEach((webServer) => {
      app.listen(webServer.port, webServer.hostname, () => {
        this._logger.info('Webservice app listening.', { port: webServer.port, hostname: webServer.hostname })
      })
    })
  }
}

export default PublicApi