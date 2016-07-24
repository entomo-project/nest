import kernel from './SchedulerKernel'
import SchedulerService from './Service/SchedulerService'

const container = kernel.serviceContainer

const logger = container.get('app.logger')

const schedulerService = new SchedulerService(
  logger,
  container.get('app.service.mongo.client'),
  container.get('app.service.request_promise_factory'),
  container.get('app.service.web_server_factory'),
  container.getParameter('web_servers'),
  container.getParameter('queue_size')
);

schedulerService.start()