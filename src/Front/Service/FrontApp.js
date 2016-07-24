import express from 'express'

class FrontApp {
  constructor(logger, webServerFactory, taskController, webServersConfiguration) {
    this._logger = logger
    this._webServerFactory = webServerFactory
    this._taskController = taskController
    this._webServersConfiguration = webServersConfiguration
  }

  start() {
    this._logger.info('Starting front app.')

    const app = this._webServerFactory()

    app.use(
      '/static',
      express.static(__dirname + '/../../../static')
    )

    this._taskController.register(app)

    this._webServersConfiguration.forEach((webServer) => {
      app.listen(webServer.port, webServer.hostname, () => {
        this._logger.info('Front app listening.', { port: webServer.port, hostname: webServer.hostname })
      })
    })
  }
}

export default FrontApp