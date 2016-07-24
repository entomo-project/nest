import ServiceContainer from './ServiceContainer'
import winston from 'winston'
import Logger from '../Service/Logger'

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

    const logger = new Logger({
      transports: [
        consoleTransport
      ]
    })

    logger.handleExceptions([
      consoleTransport
    ])

    // new (winston.transports.File)({ filename: 'somefile.log' })

    logger.level = 'debug'

    this.serviceContainer.set('app.service.logger', logger)
  }

  boot() {
    this._configureServiceContainer()
  }

  get serviceContainer() {
    return this._serviceContainer
  }
}

export default Kernel