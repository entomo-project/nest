#!/usr/bin/env node

const exec = require('child_process').exec

function callback(error, stdout, stderr) {
  if (error) {
    console.error(`exec error: ${error}`)

    return
  }

  console.log(`stdout: ${stdout}`)
  console.log(`stderr: ${stderr}`)
}

exec(
  __dirname + '/node_modules/.bin/pm2 stop all && ' + __dirname + '/node_modules/.bin/pm2 delete all',
  callback
)
