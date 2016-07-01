import kernel from './FrontKernel'

const container = kernel.serviceContainer

const logger = container.get('app.logger')

logger.info('Starting front app.')

const app = container.get('app.service.web_server_factory')()

container.get('app.controller.task').register(app)

const port = container.getParameter('web_server_port')

app.listen(port, function () {
  logger.info('Front app listening.', { port: port })
})