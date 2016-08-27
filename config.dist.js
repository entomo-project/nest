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
      baseUrl: 'http://localhost:3002'
    }
  },
  scheduler: {
    queueSize: 4,
    mongoUrl: 'mongodb://mongo:27017',
    worker: {
      baseUrl: 'http://localhost:3003'
    }
  },
  publicApi: {
    mongoUrl: 'mongodb://mongo:27017',
    allowedOrigins: [
      'http://localhost:3001',
      'https://localhost:3001',
      'http://dockerhost:3001',
      'https://dockerhost:3001'
    ]
  }
}