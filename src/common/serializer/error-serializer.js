import _ from 'lodash'

export default (err) => {
  if (!_.isObject(err)) {
    return err
  }

  const plainObject = {}

  if (undefined !== err.constructor && undefined !== err.constructor.name) {
    plainObject.className = err.constructor.name
  }

  Object.getOwnPropertyNames(err).forEach((key) => {
    plainObject[key] = err[key]
  })

  return plainObject
}
