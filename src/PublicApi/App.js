'use strict'

import kernel from './PublicApiKernel'

const container = kernel.serviceContainer

const logger = container.get('app.logger')

logger.info('Starting webservice app.')

const app = container.get('app.service.web_server_factory')()

/**
 * For development purposes
 */
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")

  next();
})

container.get('app.controller.api.v1.task').register(app)

const webServers = container.getParameter('web_servers')

webServers.forEach((webServer) => {
  app.listen(webServer.port, webServer.hostname, () => {
    logger.info('Webservice app listening.', { port: webServer.port, hostname: webServer.hostname })
  })
})
