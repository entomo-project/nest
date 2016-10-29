import Kernel from './kernel'
import makeBaseApp from '../common/make-base-app'

export default (env) => {
  return makeBaseApp(Kernel, env)
}
