import './init'
import Promise from 'bluebird'

export default (Kernel, env) => {
  return new Promise((resolve) => {
    const kernel = new Kernel(env)

    kernel.boot()

    const container = kernel.serviceContainer

    resolve(container)
  })
}