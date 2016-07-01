import ServiceContainer from './ServiceContainer'
import Logger from '../Service/Logger'


class Kernel {
  constructor() {
    this._serviceContainer = new ServiceContainer()
  }

  _configureServiceContainer() {
    const logger = new Logger()

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