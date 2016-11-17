import {
  Container,
  FunctionServiceFactoryDefinition,
  Reference,
  Parameter
} from '@bmichalski/disl'

class Kernel {
  constructor(environment) {
    this._serviceContainer = new Container()

    this.serviceContainer.setParameter('kernel.environment', environment)
  }

  _configureServiceContainer() {
    const assoc = {
      'app.service.init_server': '@bmichalski/basic-hapi-api-server',
      'app.service.factory.logger': './service/logger',
      'app.service.time': './service/time',
      'app.service.request_promise': 'request-promise'
    }

    this.serviceContainer.registerInstanceLocator((identifier) => {
      if (undefined === assoc[identifier]) {
        return
      }

      const moduleName = assoc[identifier]

      const module = require(moduleName)

      if (undefined !== module.default) {
        return module.default
      }

      return module
    })

    this.serviceContainer.setDefinition(
      'app.service.logger',
      new FunctionServiceFactoryDefinition(
        new Reference('app.service.factory.logger'),
        [ new Parameter('kernel.environment') ]
      )
    )
  }

  boot() {
    const environment = this.serviceContainer.getParameter('kernel.environment')

    this._conf = require('../../conf/conf_'+environment)

    this._configureServiceContainer(this._conf)

    this.serviceContainer
      .get('app.service.logger')
      .then(([logger]) => {
        logger.debug('Kernel booted.')
      })
  }

  get serviceContainer() {
    return this._serviceContainer
  }

  get environment() {
    return this._environment
  }
}

export default Kernel