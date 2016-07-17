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

const port = container.getParameter('web_server_port')

app.listen(port, function () {
  logger.info('Webservice app listening.', { port: port })
})