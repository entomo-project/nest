import kernel from './FrontKernel'
import BaseApp from '../Common/BaseApp'

const baseApp = new BaseApp(kernel)
baseApp
  .init()
  .then((container) => {
    const frontApp = container.get('app.service.front_app')

    frontApp.start()
  }).catch(() => {
    kernel.serviceContainer.get('app.service.logger').error('Error starting app.')
  })