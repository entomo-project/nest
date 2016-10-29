import ServiceContainer from './service-container'
import ServiceDefinition from './service-definition'

class Kernel {
  constructor(environment) {
    this._serviceContainer = new ServiceContainer()
    this._environment = environment
  }

  _configureServiceContainer() {
    const winston = require('winston')

    const consoleTransport = new (winston.transports.Console)({
      colorize: true,
      prettyPrint: true,
      timestamp: true,
      showLevel: true,
      align: true,
      stringify: true
    })

    this.serviceContainer.setDefinition(
      'app.service.init_server',
      new ServiceDefinition(() => {
        return require('@bmichalski/basic-hapi-api-server')
      })
    )

    this.serviceContainer.setDefinition(
      'app.service.logger',
      new ServiceDefinition(() => {
        const logger = new winston.Logger({
          transports: [
            consoleTransport
          ]
        })

        logger.handleExceptions([
          consoleTransport
        ])

        if ('test' === this._environment) {
          //Disable logging on console when in test environment
          logger.level = false
        } else {
          logger.level = 'debug'
        }

        return logger
      })
    )

    this.serviceContainer.setDefinition(
      'app.service.time',
      new ServiceDefinition(() => {
        return require('../service/time').default
      })
    )
  }

  boot() {
    this._configureServiceContainer()

    this._serviceContainer
      .get('app.service.logger')
      .debug('Kernel booted.')
  }

  get serviceContainer() {
    return this._serviceContainer
  }

  get environment() {
    return this._environment
  }
}

export default Kernel