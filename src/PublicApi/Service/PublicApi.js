class PublicApi {
  constructor(logger, webServerFactory, taskController, webServers) {
    this._logger = logger
    this._webServerFactory = webServerFactory
    this._taskController = taskController
    this._webServers = webServers
  }

  start() {
    this._logger.info('Starting webservice app.')

    const app = this._webServerFactory()

    /**
     * For development purposes
     */
    app.use((req, res, next) => {
      res.header("Access-Control-Allow-Origin", "*")
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")

      next();
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