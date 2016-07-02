import assert from 'assert'

class WorkerService {
  constructor(logger, webServerFactory, requestPromiseFactory, vm, port) {
    this._logger = logger
    this._webServerFactory = webServerFactory
    this._requestPromiseFactory = requestPromiseFactory
    this._vm = vm
    this._port = port
  }

  start() {
    const app = this._webServerFactory()

    app.post('/do', (req, res) => {
      assert.notStrictEqual(null, req.body.command)
      assert.notStrictEqual(undefined, req.body.command)
      assert.notStrictEqual('', req.body.command)

      assert.notStrictEqual(null, req.body.taskId)
      assert.notStrictEqual(undefined, req.body.taskId)
      assert.notStrictEqual('', req.body.taskId)

      const notifyTaskStartedOptions = {
        method: 'PUT',
        uri: 'http://localhost:3002/api/v1/task/started',
        body: {
          taskId: req.body.taskId
        },
        json: true
      }

      const onTaskStartNotified = () => {
        this._logger.info('Worker done notifying nest that task has started.', { options: notifyTaskStartedOptions })

        const done = () => {
          const notifyTaskDoneOptions = {
            method: 'PUT',
            uri: 'http://localhost:3002/api/v1/task/done',
            body: {
              taskId: req.body.taskId
            },
            json: true
          }

          this
            ._requestPromiseFactory(notifyTaskDoneOptions)
            .then(() => {
              this
                ._logger
                .info('Worker done notifying nest that task is done.', { options: notifyTaskDoneOptions })
            })
            .catch(() => {
              this
                ._logger
                .error('Worker could not notify nest that task is done.', { options: notifyTaskDoneOptions })
            })
        }

        const sandbox = {
          globalVar: 1,
          done: done,
          console: console,
          // exec: exec,
          assert: assert
        }

        this._vm.createContext(sandbox)

        this._vm.runInContext(req.body.command, sandbox)
      }

      this
        ._requestPromiseFactory(notifyTaskStartedOptions)
        .then(onTaskStartNotified)
        .catch((err) => {
          if (undefined !== err) {
            throw err
          }

          const info = { options: notifyTaskStartedOptions }

          this
            ._logger
            .error('Worker could not notify nest that task has started.', info)
        })

      res.send({ 'status': 'success' })
    })

    app.listen(this._port, () => {
      this._logger.info('Worker listening.', { port: this._port })
    })
  }
}

export default WorkerService