(function () {
    'use strict';
    
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
    
    TaskBuilder.prototype.buildTask = function () {
        var componentNames,
            components,
            that,
            data;
    
        that = this;
        
        componentNames = [
            'base'
        ];
        
        components = [];
        
        foreach(arguments, function (value) {
            componentNames.push(value);
        });
        
        foreach(componentNames, function (componentName) {
            componentName = componentName + 'Task';
            
            var componentFileName = that.componentNameComponentFileAssoc[componentName];
            
            if (undefined === componentFileName) {
                throw new Error('Found no component file for component with name "' +  componentName +'"');
            }
            
            components.push(
                require(__dirname + '/' + componentFileName).componentDefinition.component
            );
        });
                
        data = extend.apply(undefined, [{}].concat(components));
        
        var task = {
            meta: {
                components: componentNames
            },
            data: data
        };
        
        return task;
    };
        
    exports.TaskBuilder = TaskBuilder;
}());