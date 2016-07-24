import workerKernel from './WorkerKernel'

const container = workerKernel.serviceContainer

const worker = container.get('app.service.worker')

worker.start()
