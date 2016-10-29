const makeApp = require('../../../built/worker/make-app').default

const chai = require('chai')
const ObjectID = require('mongodb').ObjectID
const expect = chai.expect
const sinon = require('sinon')
const Promise = require('bluebird')
const testConfig = require('../../../config')

describe('Worker app', function() {
  this.slow(250)

  let server
  let serviceContainer

  beforeEach(function() {
    return makeApp('test')
      .then((localServiceContainer) => {
        serviceContainer = localServiceContainer

        const serverService = serviceContainer.get('app.service.server')

        return new Promise((resolve) => {
          serverService.start().then((localServer) => {
            server = localServer

            resolve()
          })
        })
      })
  })

  describe('/api/do', function() {
    const makeTestJsCode = (jsCode, makeExpectedNotifiedTaskStoppedResult) => {
      return (done) => {
        const objectId = ObjectID()
        const strObjectId = '' + objectId

        const expectedNotifiedTaskStoppedResult = makeExpectedNotifiedTaskStoppedResult(strObjectId)

        const schedulerNotifierMock = sinon.mock(serviceContainer.get('app.service.scheduler_notifier'))

        const expectedNotifyTaskStoppedArg = { output: expectedNotifiedTaskStoppedResult.output }

        if (undefined !== expectedNotifiedTaskStoppedResult.error) {
          expectedNotifyTaskStoppedArg.error = expectedNotifiedTaskStoppedResult.error
        }

        schedulerNotifierMock
          .expects('notifyTaskStarted')
          .once()
          .returns(Promise.resolve())
          .withExactArgs(testConfig.worker.scheduler.baseUrl, strObjectId)
        schedulerNotifierMock
          .expects('notifyTaskStopped')
          .once()
          .returns(Promise.resolve())
          .withExactArgs(testConfig.worker.scheduler.baseUrl, strObjectId, expectedNotifyTaskStoppedArg)

        server
          .inject({
            method: 'POST',
            url: '/api/do',
            payload: {
              taskId: strObjectId,
              jsCode: jsCode
            }
          }).then((res) => {
            expect(res.statusCode).to.be.equal(200)
            expect(res.result).to.be.deep.equal({ status: 'success' })

            server.on('app.notified_task_stopped', (result) => {
              expect(result).to.be.deep.equal(expectedNotifiedTaskStoppedResult)

              schedulerNotifierMock.verify()

              done()
            })
          })
      }
    }

    it(
      'should execute jsCode',
      makeTestJsCode(
        "done();",
        (strObjectId) => {
          return {
            taskId: strObjectId,
              output: {
            stdOut: null,
              stdErr: null,
              exitCode: null
          }
          }
        }
      )
    )

    it(
      'should expose an executeCommand function in jsCode execution context',
      makeTestJsCode(
        "executeCommand([ 'echo', 'test' ]).then(done);",
        (strObjectId) => {
          return {
            taskId: strObjectId,
            output: {
              stdOut: 'test\n',
              stdErr: null,
              exitCode: 0
            }
          }
        }
      )
    )

    it(
      'should call notifyTaskStopped only once event if done callback is called twice in js code, ignoring second call',
      makeTestJsCode(
        "done();done();",
        (strObjectId) => {
          return {
            taskId: strObjectId,
            output: {
              stdOut: null,
              stdErr: null,
              exitCode: null
            }
          }
        }
      )
    )

    it(
      'should call notifyTaskStopped once on string error',
      makeTestJsCode(
        "throw 'test'",
        (strObjectId) => {
          return {
            taskId: strObjectId,
            error: 'test',
            output: {
              stdOut: null,
              stdErr: null,
              exitCode: null
            }
          }
        }
      )
    )

    it(
      'should call notifyTaskStopped once on object error',
      makeTestJsCode(
        "throw { foo: 'bar' };",
        (strObjectId) => {
          return {
            taskId: strObjectId,
            error: { className: 'Object', foo: 'bar' },
            output: {
              stdOut: null,
              stdErr: null,
              exitCode: null
            }
          }
        }
      )
    )
  })
})