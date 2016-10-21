import ServiceContainer from './service-container'
import winston from 'winston'
import Logger from '../service/logger'
import initServer from '@bmichalski/basic-hapi-api-server'

class Kernel {
  constructor() {
    this._serviceContainer = new ServiceContainer()
  }

  _configureServiceContainer() {
    const consoleTransport = new (winston.transports.Console)({
      colorize: true,
      prettyPrint: true,
      timestamp: true,
      showLevel: true,
      align: true,
      stringify: true
    })

    this._logger = new Logger({
      transports: [
        consoleTransport
      ]
    })

    this._logger.handleExceptions([
      consoleTransport
    ])

    this._logger.level = 'debug'

    this.serviceContainer.set('app.service.init_server', initServer)

    this.serviceContainer.set('app.service.logger', this._logger)
  }

  boot() {
    this._configureServiceContainer()

    this._logger.debug('Kernel booted.')
  }

  get serviceContainer() {
    return this._serviceContainer
  }
}

export default Kernel