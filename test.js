const assert = require('assert')
const forever = require('forever')

forever.startServer()

forever.list(true, function (err, processes) {
  assert.strictEqual(null, err)

  console.log(processes)
})

forever.start('dist/PublicApi/App.js', { uid: 'PublicApi' })

// forever.list(true, function (err, processes) {
//   assert.strictEqual(null, err)
//
//   console.log(processes)
// })