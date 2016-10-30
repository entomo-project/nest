const entomoProjectNestHost = 'localhost'
const entomoProjectNestMongoHost = 'localhost'

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
    host: 'localhost',
    port: 3000,
    scheduler: {
      baseUrl: 'http://' + entomoProjectNestHost + ':3001'
    }
  },
  scheduler: {
    host: 'localhost',
    port: 3001,
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