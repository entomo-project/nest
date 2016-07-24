import kernel from './WorkerKernel'
import BaseApp from '../Common/BaseApp'

const baseApp = new BaseApp(kernel)

baseApp
  .init()
  .then((container) => {
    const worker = container.get('app.service.worker')

    worker.start()
  }).done()
