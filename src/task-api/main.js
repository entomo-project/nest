import makeApp from './make-app'

makeApp()
  .then((container) => {
    const taskApi = container.get('app.service.server')

    taskApi.start()
  })