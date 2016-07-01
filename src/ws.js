import kernel from './WsKernel'

const container = kernel.serviceContainer

const logger = container.get('app.logger')

logger.info('Starting webservice app.')

const app = container.get('app.service.web_server_factory')()

container.get('app.controller.api.v1.task').register(app)

const port = container.getParameter('web_server_port')

app.listen(port, function () {
  logger.info('Webservice app listening.', { port: port })
})