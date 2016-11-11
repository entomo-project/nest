const util = require('util')

module.exports = function(shipit) {
  require('shipit-deploy')(shipit)

  // const repositoryUrl = require('./package.json').repository.url.replace('https://', 'ssh://')
  const repositoryUrl = __dirname
  const shiptItConf = require('./conf/conf_production').shipit
  const workspace = '/tmp/shipit/build/nest'
  const deployTo = '/home/r/nest'

  shipit.initConfig({
    default: {
      workspace: workspace,
      deployTo: deployTo,
      repositoryUrl: repositoryUrl,
      branch: 'experimental-js',
      ignores: ['.git'],
      rsync: ['--del'],
      keepReleases: 5,
      deleteOnRollback: false,
      shallowClone: true
    },
    prod: {
      servers: shiptItConf
    },
    development: {
      servers: [
        'r@dockerhost:2222'
      ]
    }
  })

  const previousDeployUpdate = shipit.task('deploy:update')
  const previousDeployPublish = shipit.task('deploy:publish')

  function doOutput(res) {
    console.log('-----')
    console.log('exitCode', res.child.exitCode)
    console.log('stdout', res.stdout)
    console.log('stderr', res.stderr)
  }

  function output(ress) {
    if (ress instanceof Array) {
      ress.forEach(doOutput)
    } else {
      doOutput(ress)
    }
  }

  function makeExecuteLocalCommandInWorkspace(command) {
    return function () {
      return shipit.local(command, { cwd: workspace }).then(function (res) {
        output(res)
      })
    }
  }

  shipit.blTask(
    'deploy:update:before:npm-install',
    [],
    makeExecuteLocalCommandInWorkspace('npm install')
  )

  shipit.blTask(
    'deploy:update:before:build',
    [
      'deploy:update:before:npm-install'
    ],
    makeExecuteLocalCommandInWorkspace('npm run-script gulp')
  )

  shipit.blTask(
    'deploy:update:before:prune-dev',
    [
      'deploy:update:before:build'
    ],
    makeExecuteLocalCommandInWorkspace('npm prune --production')
  )

  shipit.blTask(
    'deploy:update:before',
    [
      'deploy:update:before:npm-install',
      'deploy:update:before:build',
      'deploy:update:before:prune-dev'
    ]
  )

  shipit.blTask(
    'deploy:publish:before:copy-conf',
    [],
    function () {
      const path = shipit.releasesPath + '/' + shipit.releaseDirname
      const remoteConfDirectory = path + '/conf'
      const remoteConfFileDestination = remoteConfDirectory + '/conf.js'
      const remoteConfFileSource = '/home/r/conf/nest/conf.js'

      return shipit.remote(
        util.format('bash --login -c "cp %s %s"', remoteConfFileSource, remoteConfFileDestination)
      ).then(function (res) {
        output(res)
      })
    }
  )

  shipit.blTask(
    'deploy:publish:before',
    [
      'deploy:publish:before:copy-conf'
    ]
  )

  shipit.blTask(
    'deploy:update',
    [
      'deploy:update:before'
    ],
    previousDeployUpdate.fn
  )

  shipit.blTask(
    'deploy:publish',
    [
      'deploy:publish:before'
    ],
    previousDeployPublish.fn
  )

  shipit.task('start-or-reload-server', function () {
    // return shipit.remote(
    //   'cd /home/r && (pm2 startOrReload /home/r/nest/current/process.json --env development)'
    // ).then(function (res) {
    //   output(res)
    // })
  })

  shipit.on('deployed', function () {
    shipit.start('start-or-reload-server')
  })
}