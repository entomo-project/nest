import Kernel from 'Common/DependencyInjection/Kernel'

const kernel = new Kernel()

kernel.boot()

console.log(kernel.serviceContainer.get('app.service.web_server_factory')())