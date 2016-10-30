module.exports = {
  shipit: {
    worker: {
      servers: [
        'r@remote_server'
      ]
    },
    scheduler: {
      servers: [
        'r@remote_server'
      ]
    }
  },
  worker: {
    host: 'localhost',
    port: 3000,
    scheduler: {
      baseUrl: 'http://entomo-project-nest:3001'
    }
  },
  scheduler: {
    host: 'localhost',
    port: 3001,
    queueSize: 4,
    mongoUrl: 'mongodb://entomo-project-nest-mongo:27017',
    workers: [
      {
        baseUrl: 'http://entomo-project-nest:3000'
      }
    ]
  }
}