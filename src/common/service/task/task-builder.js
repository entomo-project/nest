class TaskBuilder {
  constructor(timeService) {
    this._timeService = timeService
  }

  buildTask(task) {
    task.data.base.createdAt = this._timeService.getNowDate()

    task._version = 0

    return task
  }
}

export default TaskBuilder