import Promise from 'bluebird'

class ShellCommandRunner {
  constructor(spawn) {
    this._spawn = spawn
  }

  execute(args, output) {
    return new Promise((resolve, reject) => {
      const process = this._spawn(
        args[0],
        args.slice(1),
        {
          shell: '/bin/bash'
        }
      )

      process.stdout.on('data', (data) => {
        if (null === output.stdOut) {
          output.stdOut = '' + data
        } else {
          output.stdOut += data
        }
      })

      process.stderr.on('data', (data) => {
        if (null === output.stdErr) {
          output.stdErr = '' + data
        } else {
          output.stdErr += data
        }
      })

      process.on('error', (err) => {
        reject(err)
      })

      process.on('close', (exitCode) => {
        output.exitCode = exitCode

        resolve()
      })
    })
  }
}

export default ShellCommandRunner
