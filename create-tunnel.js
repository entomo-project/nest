#!/usr/bin/env node

const exec = require('child_process').exec

const config = require('./deploy.config.json')

function callback(error, stdout, stderr) {
  if (error) {
    console.error(`exec error: ${error}`)

    return
  }

  console.log(`stdout: ${stdout}`)
  console.log(`stderr: ${stderr}`)
}

exec(
  'ssh ' + config.username + '@' + config.hostname + ' -L 3001:localhost:3001',
  callback
)