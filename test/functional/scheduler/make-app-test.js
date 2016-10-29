const makeApp = require('../../../built/scheduler/make-app').default

const chai = require('chai')
const expect = chai.expect
const ObjectID = require('mongodb').ObjectID
const commonBefore = require('../common-before')
const sinon = require('sinon')

const testConfig = require('../../../config')

describe('Scheduler app', function() {
  this.slow(250)

  let server
  let mongoClient
  let testTimeService
  let serviceContainer

  beforeEach(function() {
    return commonBefore(makeApp).then((result) => {
      server = result[0]
      mongoClient = result[1]
      testTimeService = result[2]
      serviceContainer = result[3]
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