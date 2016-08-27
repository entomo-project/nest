import request from 'superagent-bluebird-promise'

class PublicApi {
  constructor(publicApiBaseUrl) {
    this._publicApiBaseUrl = publicApiBaseUrl
  }

  getTask(taskId) {
    return request(this._publicApiBaseUrl + '/api/v1/task/' + taskId)
      .set('Accept', 'application/json')
  }

  listTasks(options) {
    return request
      .get(this._publicApiBaseUrl + '/api/v1/task')
      .set('Accept', 'application/json')
      .query(options)
  }
}

export default PublicApi