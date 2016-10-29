import assert from 'assert'
import initServer from '@bmichalski/basic-hapi-api-server'
import Joi from 'joi'
import _ from 'lodash'
import Promise from 'bluebird'

class WorkerService {
  constructor(
    workerHost,
    workerPort,
    logger,
    vm,
    shellCommandRunner,
    schedulerNotifier,
    schedulerBaseUrl
  ) {
    this._workerHost = workerHost
    this._workerPort = workerPort
    this._logger = logger
    this._vm = vm
    this._shellCommandRunner = shellCommandRunner
    this._schedulerNotifier = schedulerNotifier
    this._schedulerBaseUrl = schedulerBaseUrl
  }

  _errorToSerializable(err) {
    if (!_.isObject(err)) {
      return err
    }

    const plainObject = {}

    if (undefined !== err.constructor && undefined !== err.constructor.name) {
      plainObject.className = err.constructor.name
    }

    Object.getOwnPropertyNames(err).forEach((key) => {
      plainObject[key] = err[key]
    })

    return plainObject
  }

  _doNotifyStopped(taskId, output, error) {
    assert.notStrictEqual(undefined, taskId, 'Missing required taskId')
    assert.notStrictEqual(undefined, output, 'Missing required output')
    assert.notStrictEqual(undefined, output.stdOut, 'Missing required output.stdOut')
    assert.notStrictEqual(undefined, output.stdErr, 'Missing required output.stdErr')
    assert.notStrictEqual(undefined, output.exitCode, 'Missing required output.exitCode')

    const body = {
      output: {
        stdOut: output.stdOut,
        stdErr: output.stdErr,
        exitCode: output.exitCode
      }
    }

    const serializableError = this._errorToSerializable(error)

    if (undefined !== error) {
      body.error = serializableError
    }

    return this
      ._schedulerNotifier
      .notifyTaskStopped(this._schedulerBaseUrl, taskId, body)
      .then(() => {
        const data = {
          taskId,
          output
        }

        if (undefined !== error) {
          data.error = serializableError
        }

        this._server.emit('app.notified_task_stopped', data)
      })
  }

  _makeNotifyStopped() {
    let calledOnce = false

    return (taskId, output, error) => {
      if (calledOnce) {
        this._logger.error('Should not call "notifyStopped" method more than once, returning immediately.', { taskId })

        return
      }

      calledOnce = true

      return this._doNotifyStopped(taskId, output, error)
    }
  }

  _onTaskStartNotified(taskId, jsCode) {
    assert.notStrictEqual(undefined, taskId, 'Missing required taskId')
    assert.notStrictEqual(undefined, jsCode, 'Missing required jsCode')

    const output = {
      stdOut: null,
      stdErr: null,
      exitCode: null
    }

    const notifyStopped = this._makeNotifyStopped()

    const handleError = (err) => {
      notifyStopped(taskId, output, err)
    }

    const rawSandboxContext = {
      done: () => {
        notifyStopped(taskId, output)
      },
      console: console,
      executeCommand: (args) => {
        return this
          ._shellCommandRunner
          .execute(args, output)
          .catch((err) => {
            handleError(err)

            if (err) {
              throw err
            }
          })
      },
      assert: assert
    }

    this._vm.createContext(rawSandboxContext)

    try {
      this._vm.runInContext(jsCode, rawSandboxContext)
    } catch (err) {
      handleError(err)
    }
  }

  start() {
    const doHandler = (req, res) => {
      const payload = req.payload

      const taskId = payload.taskId
      const jsCode = payload.jsCode

      this
        ._schedulerNotifier
        .notifyTaskStarted(this._schedulerBaseUrl, taskId)
        .then(this._onTaskStartNotified.bind(this, taskId, jsCode))

      return res({ 'status': 'success' })
    }

    return new Promise((resolve) => {
      initServer({
        api: {
          name: 'Worker service',
          version: '1',
          hasDocumentation: true,
          routes: [
            {
              method: 'POST',
              path:'/api/do',
              handler: doHandler,
              config: {
                description: 'Execute given task on server.',
                validate: {
                  payload: {
                    taskId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
                    jsCode: Joi.string().required()
                  }
                }
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
        this._server = server

        server.event('app.notified_task_stopped')

        server.start(() => {
          this._logger.info('Worker service started, listening on port ' + this._workerPort)
        })

        resolve(server)
      })
    })
  }
}

export default WorkerService