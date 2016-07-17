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

const port = container.getParameter('web_server_port')

app.listen(port, function () {
  logger.info('Front app listening.', { port: port })
})