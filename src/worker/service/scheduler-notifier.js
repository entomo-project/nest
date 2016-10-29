class SchedulerNotifier {
  constructor(logger, requestPromise) {
    this._logger = logger
    this._requestPromise = requestPromise
  }

  notifyTaskStarted(schedulerBaseUrl, taskId) {
    const options = {
      method: 'PUT',
      uri: schedulerBaseUrl + '/api/v1/task/' + taskId + 'started',
      json: true,
      timeout: 2000
    }

    return this
      ._requestPromise(options)
      .then(() => {
        this._logger.info('Done notifying that task has started.', { options })
      })
      .catch((err) => {
        this
          ._logger
          .error('Could not notify that task has started.', { options })

        if (undefined !== err) {
          throw err
        }
      })
  }

  notifyTaskStopped(schedulerBaseUrl, taskId, body) {
    const options = {
      method: 'PUT',
      uri: schedulerBaseUrl + '/api/v1/task/' + taskId + '/stopped',
      body: body,
      json: true
    }

    return this
      ._requestPromise(options)
      .then(() => {
        this
          ._logger
          .info('Done notifying that task is done.', { options })
      })
      .catch(() => {
        this
          ._logger
          .error('Could not notify that task is done.', { options })
      })
  }
}

export default SchedulerNotifier