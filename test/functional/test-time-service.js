const timeService = require('../../built/common/service/time').default
const _ = require('lodash')

let nowDateTime

module.exports = _.extend({}, timeService, {
  isTestTimeService: true,
  getNowDate: () => {
    if (undefined === nowDateTime) {
      nowDateTime = new Date()
    }

    return nowDateTime
  }
})
