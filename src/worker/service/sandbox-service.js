import assert from 'assert'

class SandboxService {
  constructor(vm, shellCommandRunner) {
    this._vm = vm
    this._shellCommandRunner = shellCommandRunner
  }

  makeOutput() {
    return {
      stdOut: null,
      stdErr: null,
      exitCode: null
    }
  }

  runJsCode(jsCode, output) {
    return new Promise((resolve, reject) => {
      const rawSandboxContext = {
        done: () => {
          resolve()
        },
        console: console,
        executeCommand: (args) => {
          return this
            ._shellCommandRunner
            .execute(args, output)
            .catch(reject)
        },
        assert
      }

      this._vm.createContext(rawSandboxContext)

      try {
        this._vm.runInContext(jsCode, rawSandboxContext)
      } catch (err) {
        return reject(err)
      }
    })
  }
}

export default SandboxService