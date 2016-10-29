import assert from 'assert'

class WorkerNotifier {
  constructor(logger, rp) {
    this._logger = logger
    this._rp = rp
  }

  notify(options) {
    assert.notStrictEqual(undefined, options, 'Failed asserting that argument options is not undefined.')
    assert.notStrictEqual(undefined, options.baseUrl, 'Failed asserting that option workerBaseUrl is not undefined.')
    assert.notStrictEqual(undefined, options.taskId, 'Failed asserting that option taskId is not undefined.')
    assert.notStrictEqual(undefined, options.command, 'Failed asserting that option command is not undefined.')

    return this._rp({
      method: 'POST',
      uri: options.baseUrl + '/do',
      body: {
        taskId: options.taskId,
        command: options.command
      },
      json: true
    })
    .then(() => {
      this._logger.info('Worker notified.', { options })
    })
    .catch((error) => {
      this._logger.error('Could not notify worker.', { options, error })
    })
  }
}

export default WorkerNotifier