import ServiceDefinition from './service-definition'

class ServiceContainer  {
  constructor() {
    this._servicesByName = {}
    this._serviceDefinitionsByName = {}
    this._parametersByName = {}
  }

  inject() {
    const injectArguments = arguments

    return new Promise((resolve) => {
      Promise.all(
        Array.prototype.slice.call(injectArguments, 1)
      ).then((resolvedArguments) => {
        function applyToConstructor(constructor, argArray) {
          var args = [null].concat(argArray)
          var factoryFunction = constructor.bind.apply(constructor, args)
          return new factoryFunction()
        }

        const instance = applyToConstructor(injectArguments[0], resolvedArguments)

        resolve(instance)
      })
    })
  }

  get(serviceName) {
    try {
      if (undefined === this._servicesByName[serviceName]) {
        if (undefined === this._serviceDefinitionsByName[serviceName]) {
          throw new Error('Undefined service "' + serviceName + '"')
        } else {
          this._servicesByName[serviceName] = this._serviceDefinitionsByName[serviceName].instanciate(this)
        }
      }

      return this._servicesByName[serviceName]
    } catch (e) {
      console.log('Error instanciating "' + serviceName + '"')

      throw e
    }
  }

  set(serviceName, service) {
    this._servicesByName[serviceName] = service

    return this
  }

  setDefinition(serviceName) {
    const arguments1 = arguments[1]

    if (arguments1 instanceof ServiceDefinition) {
      this._serviceDefinitionsByName[serviceName] = arguments[1]
    } else {
      this._serviceDefinitionsByName[serviceName] = new ServiceDefinition(
        (container) => {
          return container.inject.apply(container, arguments1(container))
        }
      )
    }

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