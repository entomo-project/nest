'use strict';
    
var assert = require('assert');

var foreach = require('foreach');
var extend = require('extend');

var TaskBuilder = function () {
  //TODO Inject as parameter
  this.componentNameComponentFileAssoc = {
    'baseTask': 'BaseTaskComponent',
    'commandBasedTask': 'CommandBasedTaskComponent'
  };
};

TaskBuilder.prototype = {
  componentNameComponentFileAssoc: null
};

TaskBuilder.prototype.buildTask = function (options) {
  var components,
    that,
    data,
    componentNames,
    createdBy,
    taskTypeId,
    taskTypeName;
    
  componentNames = options.components;
  createdBy = options.createdBy;
  taskTypeId = options.taskTypeId;
  taskTypeName = options.taskTypeName;

  assert.notStrictEqual(null, componentNames);
  
  assert.notStrictEqual(null, createdBy);
  assert.notStrictEqual(undefined, createdBy);
  assert.notStrictEqual('', createdBy);
  
  assert.notStrictEqual(null, taskTypeId);
  assert.notStrictEqual(undefined, taskTypeId);
  assert.notStrictEqual('', taskTypeId);
  
  assert.notStrictEqual(null, taskTypeName);
  assert.notStrictEqual(undefined, taskTypeName);
  assert.notStrictEqual('', taskTypeName);

  that = this;

  if (undefined === componentNames) {
    componentNames= [ 'base' ];
  } else {
    assert(componentNames instanceof Array);

    componentNames= [ 'base' ].concat(componentNames);
  }

  components = [];

  foreach(componentNames, function (origComponentName) {
    var componentName;

    componentName = origComponentName + 'Task';

    var componentFileName = that.componentNameComponentFileAssoc[componentName];

    if (undefined === componentFileName) {
      throw new Error('Found no component file for component with name "' + origComponentName +'"');
    }

    components.push(
      require(__dirname + '/' + componentFileName).componentDefinition.component
    );
  });

  data = extend.apply(undefined, [{}].concat(components));
  
  data.createdBy = createdBy;
  data.createdAt = new Date();
  data.taskTypeId = taskTypeId;
  data.taskTypeName = taskTypeName;

  var task = {
    meta: {
      components: componentNames
    },
    data: data
  };

  return task;
};

exports.TaskBuilder = TaskBuilder;