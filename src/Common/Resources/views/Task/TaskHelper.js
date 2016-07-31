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

function getTaskClassName(task) {
  if (error(task)) {
    return 'has-error'
  }

  if (warning(task)) {
    return 'has-warning'
  }
}

export default {
  getTaskClassName: getTaskClassName
}