class ServiceContainer  {
  constructor() {
    this._servicesByName = {}
    this._parametersByName = {}
  }

  get(serviceName) {
    if (undefined === this._servicesByName[serviceName]) {
      throw new Error('Undefined service "' + serviceName + '"')
    }

    return this._servicesByName[serviceName]
  }

  set(serviceName, service) {
    this._servicesByName[serviceName] = service

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