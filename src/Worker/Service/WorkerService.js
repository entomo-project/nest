import assert from 'assert'
import _ from 'underscore'

class WorkerService {
  constructor(logger, spawn, webServerFactory, requestPromiseFactory, vm, webServers) {
    this._logger = logger
    this._spawn = spawn
    this._webServerFactory = webServerFactory
    this._requestPromiseFactory = requestPromiseFactory
    this._vm = vm
    this._webServers = webServers
  }

  _makeDone(taskId, output) {
    var doneOnce = false

    return (error) => {
      if (doneOnce) {
        this._logger.error('Should no call "done" method more than once, returning immediately.', { taskId: taskId })

        return
      }

      doneOnce = true

      const body = {
        taskId: taskId,
        output: {
          stdOut: output.stdOut,
          stdErr: output.stdErr,
          exitCode: output.exitCode
        }
      }

      function errorToPlainObject(err) {
        const plainObject = {}

        if (undefined !== err.constructor && undefined !== err.constructor.name) {
          plainObject.className = err.constructor.name
        }

        Object.getOwnPropertyNames(err).forEach((key) => {
          plainObject[key] = err[key]
        })

        return plainObject
      }

      if (undefined !== error && _.isObject(error)) {
        body.error = errorToPlainObject(error)
      }

      const notifyTaskDoneOptions = {
        method: 'PUT',
        uri: 'http://localhost:3002/api/v1/task/stopped',
        body: body,
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
        .done()
    }
  }

  _makeExecuteCommand(output, done) {
    return (command, args) => {
      try {
        const process = this._spawn(
          command,
          args,
          {
            shell: '/bin/bash'
          }
        )

        process.stdout.on('data', (data) => {
          if (undefined === output.stdOut) {
            output.stdOut = '' + data
          } else {
            output.stdOut += data
          }
        })

        process.stderr.on('data', (data) => {
          if (undefined === output.stdErr) {
            output.stdErr = '' + data
          } else {
            output.stdErr += data
          }
        })

        return new Promise((resolve, reject) => {
          process.on('error', (err) => {
            done(err)

            reject(err)
          })

          process.on('close', (exitCode) => {
            output.exitCode = exitCode

            resolve(exitCode)
          })
        })
      } catch (err) {
        done(err)
      }
    }
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

        const output = {
          stdOut: undefined,
          stdErr: undefined,
          exitCode: undefined
        }

        const done = this._makeDone(req.body.taskId, output)

        const sandbox = {
          done: done,
          console: console,
          executeCommand: this._makeExecuteCommand(output, done),
          assert: assert
        }

        this._vm.createContext(sandbox)

        try {
          this._vm.runInContext(req.body.command, sandbox)
        } catch (err) {
          done(err)
        }
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
        .done()

      res.send({ 'status': 'success' })
    })

    this._webServers.forEach((webServer) => {
      app.listen(webServer.port, webServer.hostname, () => {
        this._logger.info('Worker listening.', { port: webServer.port, hostname: webServer.hostname })
      })
    })
  }
}

export default WorkerService