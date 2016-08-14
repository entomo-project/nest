var assert = require('assert')

var foreach = require('foreach')
var extend = require('extend')

var TaskBuilder = function () {
  //TODO Inject as parameter
  this.componentNameComponentFileAssoc = {
    'baseTask': 'BaseTaskComponent',
    'commandBasedTask': 'CommandBasedTaskComponent',
    'startAfterTask': 'StartAfterTaskComponent'
  }
}

TaskBuilder.prototype = {
  componentNameComponentFileAssoc: null
}

TaskBuilder.prototype.buildTask = function (options) {
  const optionComponentNames = options.components
  const createdBy = options.createdBy
  const taskTypeId = options.taskTypeId
  const command = options.command
  const startAfter = options.startAfter

  assert.notStrictEqual(null, optionComponentNames)

  assert.notStrictEqual(null, createdBy)
  assert.notStrictEqual(undefined, createdBy)
  assert.notStrictEqual('', createdBy)

  assert.notStrictEqual(null, taskTypeId)
  assert.notStrictEqual(undefined, taskTypeId)
  assert.notStrictEqual('', taskTypeId)

  const that = this

  var componentNames

  if (undefined === optionComponentNames) {
    componentNames = [ 'base' ]
  } else {
    assert(optionComponentNames instanceof Array)

    componentNames = [ 'base' ].concat(optionComponentNames)
  }

  const components = []

  foreach(componentNames, function (origComponentName) {
    var componentName

    componentName = origComponentName + 'Task'

    var componentFileName = that.componentNameComponentFileAssoc[componentName]

    if (undefined === componentFileName) {
      throw new Error('Found no component file for component with name "' + origComponentName +'"')
    }

    components.push(
      require(__dirname + '/' + componentFileName).componentDefinition.component
    )
  })

  const data = extend.apply(undefined, [{}].concat(components))

  data.createdBy = createdBy
  data.createdAt = new Date()
  data.taskTypeId = taskTypeId

  if (componentNames.indexOf('commandBased') !== -1) {
    assert.notStrictEqual(null, command)
    assert.notStrictEqual(undefined, command)
    assert.notStrictEqual('', command)

    data.command = command
  }

  if (componentNames.indexOf('startAfter') !== -1) {
    assert.notStrictEqual(null, startAfter)
    assert.notStrictEqual(undefined, startAfter)
    assert.notStrictEqual('', startAfter)

    assert(startAfter instanceof Date, 'Invalid startAfter, expecting Date, got ' + (typeof startAfter) + '.')

    assert(
      !isNaN(startAfter.getTime()),
      'Invalid startAfter.'
    )

    data.startAfter = startAfter
  }

  var task = {
    meta: {
      components: componentNames
    },
    data: data
  }

  return task
}

export default TaskBuilder