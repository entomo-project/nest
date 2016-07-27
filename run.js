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
  __dirname + '/node_modules/.bin/pm2 start ' + __dirname + '/dist/PublicApi/App.js -f --name public_api -- run --host localhost:3000',
  callback
)

exec(
  __dirname + '/node_modules/.bin/pm2 start ' + __dirname + '/dist/Front/App.js -f --name front -- run --host localhost:3001',
  callback
)

exec(
  __dirname + '/node_modules/.bin/pm2 start ' + __dirname + '/dist/Worker/App.js -f --name worker -- run --host localhost:3003',
  callback
)

exec(
  __dirname + '/node_modules/.bin/pm2 start ' + __dirname + '/dist/Scheduler/App.js -f --name scheduler -- run --host localhost:3002',
  callback
)