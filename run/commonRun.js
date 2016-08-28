const exec = require('child_process').exec

function callback(error, stdout, stderr) {
  if (error) {
    console.error(`exec error: ${error}`)

    return
  }

  console.log(`stdout: ${stdout}`)
  console.log(`stderr: ${stderr}`)
}

module.exports = function (scriptName, processName, host) {
  exec(
    __dirname
      + '/../node_modules/.bin/pm2 start '
    + __dirname
    + '/../dist/'
    + scriptName
    + '.js -f --name '
    + processName
    + ' -- run --host '
    + host,
    callback
  )
}
