const Promise = require('bluebird')
const testTimeService = require('./test-time-service')

module.exports = function (makeApp) {
  return makeApp('test')
    .then((serviceContainer) => {
      serviceContainer.set('app.service.time', testTimeService)

      const mongoClientService = serviceContainer.get('app.service.mongo.client')
      const serverService = serviceContainer.get('app.service.server')

      return Promise.all([
        new Promise((resolve) => {
          serverService.start().then((server) => {
            resolve(server)
          })
        }),
        new Promise((resolve) => {
          mongoClientService.connect('nest').then((db) => {
            db.dropDatabase().then(() => {
              resolve(mongoClientService)
            })
          })
        }),
        new Promise((resolve) => {
          resolve(testTimeService)
        }),
        new Promise((resolve) => {
          resolve(serviceContainer)
        })
      ])
    })
}