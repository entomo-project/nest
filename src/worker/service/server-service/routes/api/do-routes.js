import assert from 'assert'
import errorSerializer from '../../../../../common/serializer/error-serializer'
import Joi from 'joi'

class DoRoutes {
  constructor(logger, sandbox, schedulerNotifier, schedulerBaseUrl) {
    this._logger = logger
    this._sandbox = sandbox
    this._schedulerNotifier = schedulerNotifier
    this._schedulerBaseUrl = schedulerBaseUrl
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

    const serializableError = errorSerializer(error)

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

        this._emit('app.notified_task_stopped', data)
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

    const output = this._sandbox.makeOutput()

    const notifyStopped = this._makeNotifyStopped()

    const handleError = (err) => {
      notifyStopped(taskId, output, err)
    }

    this
      ._sandbox
      .runJsCode(jsCode, output)
      .then(() => {
        notifyStopped(taskId, output)
      })
      .catch(handleError)
  }

  doHandler(req, res) {
    const payload = req.payload

    const taskId = payload.taskId
    const jsCode = payload.jsCode

    this
      ._schedulerNotifier
      .notifyTaskStarted(this._schedulerBaseUrl, taskId)
      .then(this._onTaskStartNotified.bind(this, taskId, jsCode))

    return res({ 'status': 'success' })
  }

  register(routes, events) {
    routes.push({
      method: 'POST',
      path:'/api/do',
      handler: this.doHandler.bind(this),
      config: {
        description: 'Execute given task on server.',
        validate: {
          payload: {
            taskId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
            jsCode: Joi.string().required()
          }
        }
      }
    })

    events.push('app.notified_task_stopped')
  }

  set emit(emit) {
    this._emit = emit
  }
}

export default DoRoutes