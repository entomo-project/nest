const WorkerNotifier = require('../../../../built/scheduler/service/worker-notifier').default
const sinon = require('sinon')

describe('Scheduler worker notifier test', function () {
  describe('notify', function () {
    it('should notify worker that a job is to be executed', function () {
      const fakeRpWrapper = {
        fakeRp: () => {}
      }

      const fakeLogger = {
        info: () => {}
      }

      const fakeLoggerMock = sinon.mock(fakeLogger)
      const fakeRpWrapperMock = sinon.mock(fakeRpWrapper)

      const options = {
        taskId: 'foobar',
        command: 'echo test',
        baseUrl: 'http://localhost:4242'
      }

      fakeLoggerMock
        .expects('info')
        .once()
        .withExactArgs('Worker notified.', { options: options })

      fakeRpWrapperMock
        .expects('fakeRp')
        .once()
        .returns(Promise.resolve())
        .withExactArgs({
          body: {
            command: 'echo test',
            taskId: 'foobar'
          },
          json: true,
          method: 'POST',
          uri: 'http://localhost:4242/do'
        })

      const workerNotifier = new WorkerNotifier(
        fakeLogger,
        fakeRpWrapper.fakeRp
      )

      workerNotifier.notify(options).then(() => {
        fakeLoggerMock.verify()
        fakeRpWrapperMock.verify()
      })
    })

    it('should not throw an exception but log an error in case there is one', function () {
      const fakeRpWrapper = {
        fakeRp: () => {}
      }

      const fakeLogger = {
        error: () => {}
      }

      const options = {
        taskId: 'foobar',
        command: 'echo test',
        baseUrl: 'http://localhost:4242'
      }

      const fakeLoggerMock = sinon.mock(fakeLogger)
      const fakeRpWrapperMock = sinon.mock(fakeRpWrapper)

      const error = new Error()

      fakeLoggerMock
        .expects('error')
        .once()
        .withExactArgs('Could not notify worker.', { options, error: error })

      fakeRpWrapperMock
        .expects('fakeRp')
        .once()
        .returns(Promise.reject(error))
        .withExactArgs({
          body: {
            command: 'echo test',
            taskId: 'foobar'
          },
          json: true,
          method: 'POST',
          uri: 'http://localhost:4242/do'
        })

      const workerNotifier = new WorkerNotifier(
        fakeLogger,
        fakeRpWrapper.fakeRp
      )

      workerNotifier
        .notify(options)
        .then(() => {
          fakeLoggerMock.verify()
          fakeRpWrapperMock.verify()
        })
    })
  })
})