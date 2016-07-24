class ServiceDefinition {
  constructor(instanciator) {
    this._instanciator = instanciator
  }

  instanciate(serviceContainer) {
    return this._instanciator(serviceContainer)
  }
}

export default ServiceDefinition