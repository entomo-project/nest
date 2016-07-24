import kernel from './PublicApiKernel'
import BaseApp from '../Common/BaseApp'

const app = new BaseApp(kernel)

app
  .init()
  .then((container) => {
    const publicApi = container.get('app.service.public_api')

    publicApi.start()
  })
  .done()

