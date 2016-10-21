import assert from 'assert'
import _ from 'lodash'
import initServer from '@bmichalski/basic-hapi-api-server'

class WorkerService {
  constructor(
    workerHost,
    workerPort,
    logger,
    spawn,
    requestPromiseFactory,
    vm,
    schedulerBaseUrl
  ) {
    this._workerHost = workerHost
    this._workerPort = workerPort
    this._logger = logger
    this._spawn = spawn
    this._requestPromiseFactory = requestPromiseFactory
    this._vm = vm
    this._schedulerBaseUrl = schedulerBaseUrl
  }

  _makeDone(taskId, output) {
    var doneOnce = false

    return (error) => {
      if (doneOnce) {
        this._logger.error('Should not call "done" method more than once, returning immediately.', { taskId: taskId })

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
        uri: this._schedulerBaseUrl + '/api/v1/task/stopped',
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
    const doHandler = (req, res) => {
      const payload = req.payload

      assert.notStrictEqual(null, payload.command)
      assert.notStrictEqual(undefined, payload.command)
      assert.notStrictEqual('', payload.command)

      assert.notStrictEqual(null, payload.taskId)
      assert.notStrictEqual(undefined, payload.taskId)
      assert.notStrictEqual('', payload.taskId)

      const notifyTaskStartedOptions = {
        method: 'PUT',
        uri: this._schedulerBaseUrl + '/api/v1/task/started',
        body: {
          taskId: payload.taskId
        },
        json: true,
        timeout: 2000
      }

      const onTaskStartNotified = () => {
        this._logger.info('Worker done notifying nest that task has started.', { options: notifyTaskStartedOptions })

        const output = {
          stdOut: undefined,
          stdErr: undefined,
          exitCode: undefined
        }

        const done = this._makeDone(payload.taskId, output)

        const sandbox = {
          done: done,
          console: console,
          executeCommand: this._makeExecuteCommand(output, done),
          assert: assert
        }

        this._vm.createContext(sandbox)

        console.log(payload.command)

        try {
          this._vm.runInContext(payload.command, sandbox)
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

      res({ 'status': 'success' })
    }

    initServer({
      api: {
        name: 'Worker service',
        version: '1',
        hasDocumentation: true,
        routes: [
          {
            method: 'POST',
            path:'/do',
            handler: doHandler,
            config: {
              description: 'Execute given task on server.'
            }
          }
        ]
      },
      server: {
        connections: [
          {
            host: this._workerHost,
            port: this._workerPort
          }
        ]
      }
    }).then((server) => {
      server.start(() => {
        console.log('Worker service started, listening on port ' + this._workerPort)
      })
    })
  }
}

export default WorkerService