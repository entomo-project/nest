const makeApp = require('../../../built/scheduler/make-app').default

const chai = require('chai')
const expect = chai.expect
const ObjectID = require('mongodb').ObjectID
const sinon = require('sinon')
const testTimeService = require('../test-time-service')
const Promise = require('bluebird')

const testConfig = require('../../../config')

describe('Scheduler app', function() {
  this.slow(250)

  let server
  let mongoClient
  let serviceContainer

  beforeEach(function() {
    return makeApp('test')
      .then((localServiceContainer) => {
        serviceContainer = localServiceContainer

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
          })
        ]).then((result) => {
          server = result[0]
          mongoClient = result[1]
        })
      })
  })

  describe('POST /api/task', function() {
    it('should create given task', function(done) {
      server.inject({
        method: 'POST',
        url: '/api/task',
        payload: {
          components: [ 'commandBased' ],
          command: "echo 'test'",
          createdBy: 'bmichalski',
          type: 'foobar'
        }
      }).then((res) => {
        expect(res.statusCode).to.equal(200)
        expect(res.result).to.deep.equal({ status: 'success' })

        mongoClient
          .collection('nest', 'task')
          .then((collection) => {
            collection
              .find({}, (err, iterator) => {
                if (null !== err) {
                  throw err
                }

                iterator.toArray().then((results) => {
                  expect(results).to.have.lengthOf(1)

                  expect(results[0]).to.have.all.keys([
                    '_id',
                    'meta',
                    'data'
                  ])

                  expect(results[0]._id).to.be.instanceOf(ObjectID)

                  expect(results[0].meta).to.deep.equal({ components: [ 'base', 'commandBased' ] })

                  expect(results[0].data).to.have.all.keys([
                    'command',
                    'stdout',
                    'stderr',
                    'createdBy',
                    'createdAt',
                    'type'
                  ])

                  expect(results[0].data.command).to.be.equal('echo \'test\'')
                  expect(results[0].data.createdBy).to.be.equal('bmichalski')
                  expect(results[0].data.createdAt.getTime()).to.be.equal(testTimeService.getNowDate().getTime())
                  expect(results[0].data.type).to.be.equal('foobar')
                  expect(results[0].data.stdout).to.be.equal(null)
                  expect(results[0].data.stderr).to.be.equal(null)

                  done()
                })
              })
          })
      })
    })
  })

  describe('GET /api/task/:id', function() {
    it('should return task with id', function(done) {
      mongoClient
        .collection('nest', 'task')
        .then((collection) => {
          const objectId = ObjectID()

          collection
            .insertOne(
              {
                _id: objectId,
                foo: 'bar'
              },
              (err) => {
                if (err) {
                  throw err
                }

                const url = '/api/task/' + objectId

                server.inject({
                  method: 'GET',
                  url: url
                }).then((res) => {
                  expect(res.statusCode).to.equal(200)
                  expect(res.result).to.have.keys([
                    'status',
                    'result'
                  ])

                  expect(res.result.result).to.have.keys([
                    '_id',
                    'foo'
                  ])

                  expect(res.result.status).to.equal('success')

                  expect(res.result.result._id.toString()).to.equal(objectId.toString())
                  expect(res.result.result.foo).to.equal('bar')

                  done()
                })
              }
            )
        })
    })

    it('should return a 404 if task does not exists', function(done) {
      const objectId = ObjectID()

      const url = '/api/task/' + objectId

      server.inject({
        method: 'GET',
        url: url
      }).then((res) => {
        expect(res.statusCode).to.equal(404)
        expect(res.result).to.be.deep.equal({ status: 'not_found' })

        done()
      })
    })
  })

  describe('PUT /api/task/started', function() {
    it('should mark task as started', function(done) {
      const objectId = ObjectID()

      mongoClient
        .collection('nest', 'task')
        .then((collection) => {
          collection
            .insertOne(
              {
                _id: objectId
              },
              (err) => {
                if (err) {
                  throw err
                }

                server.inject({
                  method: 'PUT',
                  url: '/api/task/' + objectId + '/started'
                }).then((res) => {
                  expect(res.statusCode).to.equal(200)
                  expect(res.result).to.deep.equal({ status: 'success' })

                  collection
                    .findOne(
                      { _id: objectId },
                      (err, result) => {
                        if (err) {
                          throw err
                        }

                        expect(result.data.startedAt.getTime()).to.equal(testTimeService.getNowDate().getTime())
                      }
                    )

                  done()
                })
              }
            )
        })
    })

    it('should return a 404 if there has been 0 task marked as started', function(done) {
      const objectId = ObjectID()
      const objectId2 = ObjectID()

      mongoClient
        .collection('nest', 'task')
        .then((collection) => {
          collection
            .insertOne(
              {
                _id: objectId2
              },
              (err) => {
                if (err) {
                  throw err
                }

                server.inject({
                  method: 'PUT',
                  url: '/api/task/' + objectId + '/started'
                }).then((res) => {
                  expect(res.statusCode).to.equal(404)
                  expect(res.result).to.deep.equal({ status: 'not_found' })

                  done()
                })
              }
            )
        })
    })
  })

  describe('PUT /api/task/stopped', function() {
    it('should mark task as stopped', function(done) {
      const objectId = ObjectID()

      const workerNotifierMock = sinon.mock(serviceContainer.get('app.service.worker_notifier'))

      workerNotifierMock.expects('notify').once().withExactArgs({
        taskId: objectId,
        command: 'echo foobar',
        baseUrl: testConfig.scheduler.workers[0].baseUrl
      })

      mongoClient
        .collection('nest', 'task')
        .then((collection) => {
          collection
            .insertOne(
              {
                _id: objectId,
                meta: {
                  components: [
                    'commandBased'
                  ]
                },
                data: {
                  startedAt: null,
                  command: 'echo foobar'
                }
              },
              (err) => {
                if (err) {
                  throw err
                }

                server.on('app.task_added_to_queue', () => {
                  server.inject({
                    method: 'PUT',
                    url: '/api/task/' + objectId + '/stopped',
                    payload: {
                      stderr: 'err_content',
                      stdout: 'out_content'
                    }
                  }).then((res) => {
                    expect(res.statusCode).to.equal(200)
                    expect(res.result).to.deep.equal({ status: 'success' })

                    collection
                      .findOne(
                        { _id: objectId },
                        (err, result) => {
                          if (err) {
                            throw err
                          }

                          expect(result.data.stoppedAt.getTime()).to.equal(testTimeService.getNowDate().getTime())
                          expect(result.data.stderr).to.equal('err_content')
                          expect(result.data.stdout).to.equal('out_content')
                        }
                      )

                    workerNotifierMock
                      .verify()

                    workerNotifierMock.restore()

                    done()
                  })
                })

                server.emit('app.check_if_tasks')
              }
            )
        })
    })

    it('should return a 404 if there has been 0 task marked as stopped', function(done) {
      const objectId = ObjectID()
      const objectId2 = ObjectID()

      mongoClient
        .collection('nest', 'task')
        .then((collection) => {
          collection
            .insertOne(
              {
                _id: objectId2
              },
              (err) => {
                if (err) {
                  throw err
                }

                server.inject({
                  method: 'PUT',
                  url: '/api/task/' + objectId + '/stopped',
                  payload: {
                    stderr: '',
                    stdout: ''
                  }
                }).then((res) => {
                  expect(res.statusCode).to.equal(404)
                  expect(res.result).to.deep.equal({ status: 'not_found' })

                  done()
                })
              }
            )
        })
    })
  })
})