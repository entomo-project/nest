import kernel from './worker-kernel'
import BaseApp from '../common/make-base-app'

const app = new BaseApp(kernel)

app
  .init()
  .then((container) => {
    const worker = container.get('app.service.worker')

    worker.start()
  })
