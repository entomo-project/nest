import program from 'commander'
import Promise from 'promise'

class BaseApp {
  constructor(kernel) {
    this._kernel = kernel
  }

  init() {
    function collect(val, values) {
      values.push(val);

      return values;
    }

    return new Promise((resolve, reject) => {
      try {
        program
          .command('run')
          .description('run webservers')
          .option('--host [hostname]:[port]', 'Hostname and port, format [hostname]:[port]', collect, [])
          .action((options) => {
            const hosts = options.host

            const container = this._kernel.serviceContainer

            const webServers = []

            hosts.forEach((host) => {
              const hostnameAndPort = host.split(':')

              if (hostnameAndPort.length === 1) {
                hostnameAndPort.push(':')
              }

              webServers.push({
                hostname: hostnameAndPort[0],
                port: hostnameAndPort[1]
              })
            })

            container.setParameter('app.web_servers', webServers)

            resolve(container)
          })

        program.parse(process.argv)
      } catch (e) {
        console.log(e)

        this._kernel.container.get('app.service.logger').error('Error starting app.')

        reject(e)
      }
    })
  }
}

export default BaseApp