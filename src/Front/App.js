'use strict'

import kernel from './FrontKernel'
import express from 'express'

const container = kernel.serviceContainer

const logger = container.get('app.logger')

logger.info('Starting front app.')

const app = container.get('app.service.web_server_factory')()

app.use(
  '/static',
  express.static(__dirname + '/../../static')
)

container.get('app.controller.task').register(app)

const webServers = container.getParameter('web_servers')

webServers.forEach((webServer) => {
  app.listen(webServer.port, webServer.hostname, () => {
    logger.info('Front app listening.', { port: webServer.port, hostname: webServer.hostname })
  })
})
