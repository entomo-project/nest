import makeApp from './make-app'

makeApp(process.env.NODE_ENV)
  .then((container) => {
    const server = container.get('app.service.server').then((serverService) => {
      serverService.start()
    })
  })