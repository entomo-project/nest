class ServiceContainer  {
  constructor() {
    this._servicesByName = {}
    this._serviceDefinitionsByName = {}
    this._parametersByName = {}
  }

  get(serviceName) {
    if (undefined === this._servicesByName[serviceName]) {
      if (undefined === this._serviceDefinitionsByName[serviceName]) {
        throw new Error('Undefined service "' + serviceName + '"')
      } else {
        this._servicesByName[serviceName] = this._serviceDefinitionsByName[serviceName].instanciate(this)
      }
    }

    return this._servicesByName[serviceName]
  }

  set(serviceName, service) {
    this._servicesByName[serviceName] = service

    return this
  }

  setDefinition(serviceName, serviceDefinition) {
    this._serviceDefinitionsByName[serviceName] = serviceDefinition

    return this
  }

  getParameter(parameterName) {
    if (undefined === this._parametersByName[parameterName]) {
      throw new Error('Undefined parameter "' + parameterName + '"')
    }

    return this._parametersByName[parameterName]
  }

  setParameter(parameterName, value) {
    this._parametersByName[parameterName] = value

    return this
  }
}

export default ServiceContainer