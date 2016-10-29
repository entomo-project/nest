import makeApp from './make-app'

makeApp()
  .then((container) => {
    const server = container.get('app.service.server')

    server.start()
  })