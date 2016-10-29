import assert from 'assert'
import _ from 'lodash'

class TaskBuilder {
  constructor(timeService) {
    this._timeService = timeService

    //TODO Inject as parameter
    this.componentNameComponentFileAssoc = {
      baseTask: 'base-task-component',
      commandBasedTask: 'command-based-task-component',
      startAfterTask: 'start-after-task-component'
    }
  }

  buildTask(options) {
    const optionComponentNames = options.components
    const createdBy = options.createdBy
    const type = options.type
    const startAfter = options.startAfter

    let componentNames

    if (undefined === optionComponentNames) {
      componentNames = [ 'base' ]
    } else {
      assert(optionComponentNames instanceof Array)

      componentNames = [ 'base' ].concat(optionComponentNames)
    }

    const components = []

    _.forEach(componentNames, (origComponentName) => {
      const componentName = origComponentName + 'Task'

      const componentFileName = this.componentNameComponentFileAssoc[componentName]

      if (undefined === componentFileName) {
        throw new Error('Found no component file for component with name "' + origComponentName +'"')
      }

      components.push(
        require(__dirname + '/' + componentFileName).componentDefinition.component
      )
    })

    const data = _.extend.apply(undefined, [{}].concat(components))

    data.createdBy = createdBy
    data.createdAt = this._timeService.getNowDate()
    data.type = type

    if (componentNames.indexOf('commandBased') !== -1) {
      const command = options.command

      assert.notStrictEqual(undefined, command)

      data.command = command
    }

    if (componentNames.indexOf('start-after') !== -1) {
      data.startAfter = startAfter
    }

    _.each(data, (val, i) => {
      if (undefined === val) {
        delete data[i]
      }
    })

    const task = {
      meta: {
        components: componentNames
      },
      data: data
    }

    return task
  }
}

export default TaskBuilder