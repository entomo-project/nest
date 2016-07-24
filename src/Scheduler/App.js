import kernel from './SchedulerKernel'
import BaseApp from '../Common/BaseApp'

const app = new BaseApp(kernel)

app
  .init()
  .then((container) => {
    const schedulerService = container.get('app.service.scheduler')

    schedulerService.start()
  })
  .done()
