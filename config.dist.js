module.exports = {
  front: {
    public: {
      publicApi: {
        baseUrl: 'http://dockerhost:3000'
      }
    }
  },
  worker: {
    scheduler: {
      baseUrl: 'http://entomo-project-nest:3002'
    }
  },
  scheduler: {
    queueSize: 4,
    mongoUrl: 'mongodb://entomo-project-nest-mongo:27017',
    workers: [
      {
        baseUrl: 'http://entomo-project-nest:3003'
      }
    ]
  },
  publicApi: {
    mongoUrl: 'mongodb://entomo-project-nest-mongo:27017',
    allowedOrigins: [
      'http://dockerhost:3001'
    ]
  }
}