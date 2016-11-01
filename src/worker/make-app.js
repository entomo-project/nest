import Kernel from './kernel'
import assert from 'assert'
import makeBaseApp from '../common/make-base-app'

export default (env) => {
  assert.notStrictEqual(undefined, env, 'Missing env parameter.')

  return makeBaseApp(Kernel, env)
}
