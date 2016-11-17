const entomoProjectNestHost = 'localhost'
const entomoProjectNestMongoHost = 'entomo-project-nest-mongo'
const Fs = require('fs')

module.exports = {
  shipit: {
    worker: {
      servers: [
        'r@dockerhost:2222',
      ]
    },
    scheduler: {
      servers: [
        'r@dockerhost:2222'
      ]
    }
  },
  worker: {
    host: '0.0.0.0',
    port: 3000,
    scheduler: {
      baseUrl: 'http://' + entomoProjectNestHost + ':3001'
    }
  },
  scheduler: {
    host: '0.0.0.0',
    https: {
      port: 3001,
      key: Fs.readFileSync(__dirname + '/../../temp2/server/privkey.pem'),
      cert: Fs.readFileSync(__dirname + '/../../temp2/server/fullchain.pem')
    },
    queueSize: 4,
    mongo: {
      host: entomoProjectNestMongoHost,
      port: 27017,
      database: 'nest'
    },
    workers: [
      {
        baseUrl: 'http://' + entomoProjectNestHost + ':3000'
      }
    ]
  }
}