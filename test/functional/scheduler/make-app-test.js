const makeApp = require('../../../built/scheduler/make-app').default

const chai = require('chai')
const expect = chai.expect
const ObjectID = require('mongodb').ObjectID
const sinon = require('sinon')
const testTimeService = require('../test-time-service')
const Promise = require('bluebird')

const testConfig = require('../../../conf/conf_test')

describe('Scheduler app', function() {
  this.slow(250)

  let server
  let db
  let serviceContainer
  let taskCollection

  beforeEach(function() {
    return makeApp('test')
      .then((localServiceContainer) => {
        serviceContainer = localServiceContainer

        serviceContainer.set('app.service.time', testTimeService)

        const mongoDbConnectionService = serviceContainer.get('app.service.mongo.connection')

        return serviceContainer
          .get('app.service.server')
          .then((serverService) => {
            return Promise.all([
              serverService.start().then((localServer) => {
                server = localServer
              }),
              mongoDbConnectionService.then((localDb) => {
                db = localDb

                return db.dropDatabase()
              }),
              serviceContainer.get('app.service.mongo.collection.task').then((localTaskCollection) => {
                taskCollection = localTaskCollection
              })
            ])
          })
      })
  })

  afterEach(() => {
    db.close()
  })

  describe('POST /api/task', function() {
    it('should create given task', function(done) {
      server.inject({
        method: 'POST',
        url: '/api/task',
        payload: {
          meta: {
            components: [ 'commandBased' ]
          },
          data: {
            base: {
              createdBy: 'bmichalski',
              type: 'foobar'
            },
            commandBased: {
              command: "echo 'test'"
            }
          }
        }
      }).then((res) => {
        expect(res.statusCode).to.equal(200)
        expect(res.result).to.deep.equal({ status: 'success' })

        taskCollection
          .find({})
          .toArray()
          .then((results) => {
            expect(results).to.have.lengthOf(1)

            expect(results[0]).to.have.all.keys([
              '_id',
              '_version',
              'meta',
              'data'
            ])

            expect(results[0]._id).to.be.instanceOf(ObjectID)

            expect(results[0]._version).to.be.equal(0)

            expect(results[0].meta).to.deep.equal({ components: [ 'commandBased' ] })

            expect(results[0].data).to.have.all.keys([
              'base',
              'commandBased'
            ])

            expect(results[0].data.base).to.have.all.keys([
              'createdBy',
              'createdAt',
              'type'
            ])

            expect(results[0].data.commandBased).to.have.all.keys([
              'command'
            ])

            expect(results[0].data.base.createdBy).to.be.equal('bmichalski')
            expect(results[0].data.base.createdAt.getTime()).to.be.equal(testTimeService.getNowDate().getTime())
            expect(results[0].data.base.type).to.be.equal('foobar')

            expect(results[0].data.commandBased.command).to.be.equal('echo \'test\'')

            done()
          })
      })
    })
  })

  describe('GET /api/task/:id', function() {
    it('should return task with id', function(done) {
      const objectId = ObjectID()

      taskCollection
        .insertOne({
          _id: objectId,
          _version: 0
        })
        .then(() => {
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
              '_version'
            ])

            expect(res.result.status).to.equal('success')

            expect(res.result.result._id.toString()).to.equal(objectId.toString())
            expect(res.result.result._version).to.equal(0)

            done()
          })
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

  describe('PUT /api/task/{id}/started', function() {
    it('should mark task as started', function(done) {
      const objectId = ObjectID()

      taskCollection
        .insertOne({
          _id: objectId
        })
        .then(() => {
          server.inject({
            method: 'PUT',
            url: '/api/task/' + objectId + '/started'
          }).then((res) => {
            expect(res.statusCode).to.equal(200)
            expect(res.result).to.deep.equal({ status: 'success' })

            taskCollection
              .findOne({ _id: objectId })
              .then((result) => {
                expect(result.data.base.startedAt.getTime()).to.equal(testTimeService.getNowDate().getTime())

                done()
              })
          })
        })
    })

    it('should return a 404 if there has been 0 task marked as started', function(done) {
      const objectId = ObjectID()
      const objectId2 = ObjectID()

      taskCollection
        .insertOne(
          {
            _id: objectId2
          }
        )
        .then(() => {
          server.inject({
            method: 'PUT',
            url: '/api/task/' + objectId + '/started'
          }).then((res) => {
            expect(res.statusCode).to.equal(404)
            expect(res.result).to.deep.equal({ status: 'not_found' })

            done()
          })
        })
    })
  })

  describe('PUT /api/task/{id}/stopped', function() {
    it('should mark task as stopped', function(done) {
      const objectId = ObjectID()

      serviceContainer
        .get('app.service.worker_notifier')
        .then((workerNotifier) => {
          const workerNotifierMock = sinon.mock(workerNotifier)

          workerNotifierMock.expects('notify').once().withExactArgs({
            taskId: objectId,
            command: 'echo foobar',
            baseUrl: testConfig.scheduler.workers[0].baseUrl
          })

          taskCollection
            .insertOne(
              {
                _id: objectId,
                meta: {
                  components: [
                    'commandBased'
                  ]
                },
                data: {
                  commandBased: {
                    command: 'echo foobar'
                  }
                }
              }
            )
            .then(() => {
              server.on('app.task_added_to_queue', () => {
                server.inject({
                  method: 'PUT',
                  url: '/api/task/' + objectId + '/stopped',
                  payload: {
                    stderr: 'err_content',
                    stdout: 'out_content'
                  }
                })
                  .then((res) => {
                    expect(res.statusCode).to.equal(200)
                    expect(res.result).to.deep.equal({ status: 'success' })

                    taskCollection
                      .findOne({ _id: objectId })
                      .then((result) => {
                        expect(result.data.commandBased.stoppedAt.getTime()).to.equal(testTimeService.getNowDate().getTime())
                        expect(result.data.commandBased.stderr).to.equal('err_content')
                        expect(result.data.commandBased.stdout).to.equal('out_content')

                        workerNotifierMock.verify()

                        workerNotifierMock.restore()

                        done()
                      })
                  })
              })

              server.emit('app.check_if_tasks')
            })
        })
    })

    it('should return a 404 if there has been 0 task marked as stopped', function(done) {
      const objectId = ObjectID()
      const objectId2 = ObjectID()

      taskCollection
        .insertOne(
          {
            _id: objectId2
          }
        )
        .then(() => {
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
        })
    })
  })
})