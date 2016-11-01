import './init'
import Promise from 'bluebird'
import assert from 'assert'

export default (Kernel, env) => {
  assert.notStrictEqual(undefined, Kernel, 'Missing Kernel parameter.')
  assert.notStrictEqual(undefined, env, 'Missing env parameter.')

  return new Promise((resolve) => {
    const kernel = new Kernel(env)

    kernel.boot()

    const container = kernel.serviceContainer

    resolve(container)
  })
}