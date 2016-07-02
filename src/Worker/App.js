import workerKernel from './workerKernel'

const container = workerKernel.serviceContainer

const worker = container.get('app.service.worker')

worker.start()



