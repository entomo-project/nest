function error(task) {
  return undefined !== task.workerError
}

function warning(task) {
  return (
    undefined !== task.data
    && undefined !== task.data.output
    && undefined !== task.data.output.exitCode
    && 0 !== task.data.output.exitCode
  )
}

function success(task) {
  return (
    undefined !== task.data
    && undefined !== task.data.startedAt
    && undefined !== task.data.stoppedAt
  )
}

function notStarted(task) {
  return (
    undefined !== task.data
    && undefined === task.data.startedAt
  )
}

function notDoneYet(task) {
  return (
    undefined !== task.data
    && undefined !== task.data.startedAt
    && undefined === task.data.stoppedAt
  )
}

function getTaskClassName(task) {
  if (error(task)) {
    return 'has-error'
  }

  if (warning(task)) {
    return 'has-warning'
  }

  if (success(task)) {
    return 'successful'
  }

  if (notDoneYet(task)) {
    return 'not-done-yet'
  }

  if (notStarted(task)) {
    return 'not-started'
  }
}

export default {
  getTaskClassName: getTaskClassName
}