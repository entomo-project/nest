import ServiceContainer from './ServiceContainer'
import winston from 'winston'
import Logger from '../Service/Logger'

class Kernel {
  constructor() {
    this._serviceContainer = new ServiceContainer()
  }

  _configureServiceContainer() {
    const logger = new Logger({
      transports: [
        new (winston.transports.Console)()
      ]
    })

    // new (winston.transports.File)({ filename: 'somefile.log' })

    logger.level = 'debug'

    this.serviceContainer.set('app.logger', logger)
  }

  boot() {
    this._configureServiceContainer()
  }

  get serviceContainer() {
    return this._serviceContainer;
  }
}

export default Kernel