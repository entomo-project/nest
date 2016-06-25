(function () {
    'use strict';
    
    var ServiceContainer = function () {
        this.servicesByName = {};
    };
    
    ServiceContainer.prototype = {
        servicesByName: null
    };
    
    ServiceContainer.prototype.get = function (serviceName) {
        if (undefined === this.servicesByName[serviceName]) {
            throw new Error('Undefined service "' + serviceName + '"');
        }
        
        return this.servicesByName[serviceName];
    };
    
    ServiceContainer.prototype.set = function (serviceName, service) {        
        this.servicesByName[serviceName] = service;
        
        return this;
    };
    
    return ServiceContainer;
});