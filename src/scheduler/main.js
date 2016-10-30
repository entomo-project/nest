import makeApp from './make-app'

makeApp()
  .then((container) => {
    const server = container.get('app.service.server').then((serverService) => {
      serverService.start()
    })
  })