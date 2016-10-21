import './init'
import Promise from 'bluebird'

class BaseApp {
  constructor(kernel) {
    this._kernel = kernel
  }

  init() {
    return new Promise((resolve) => {
      const container = this._kernel.serviceContainer

      resolve(container)
    })
  }
}

export default BaseApp