#!/usr/bin/env node

const assert = require('assert')
const spawn = require('child_process').spawn
const config = require('./deploy.config.json')

const rsync = spawn(
  'rsync',
  [
    '-e',
    'ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null',
    '-avz',
    '--exclude',
    '.idea',
    '--exclude',
    '.git',
    '.',
    config.username + '@' + config.hostname + ':/home/r/nest'
  ]
)

rsync.stdout.on('data', (data) => {
  console.log(""+data);
});

rsync.stderr.on('data', (data) => {
  console.log(""+data);
});

rsync.on('close', (code) => {
  console.log(`child process exited with code ${code}`);
});