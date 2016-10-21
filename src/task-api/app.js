import kernel from './task-api-kernel'
import BaseApp from '../common/base-app'

const app = new BaseApp(kernel)

app
  .init()
  .then((container) => {
    const publicApi = container.get('app.service.task_api')

    publicApi.start()
  })
