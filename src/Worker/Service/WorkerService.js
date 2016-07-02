import assert from 'assert'

class WorkerService {
  constructor(logger, webServerFactory, requestPromiseFactory, vm, port) {
    this._logger = logger
    this._webServerFactory = webServerFactory
    this._requestPromiseFactory = requestPromiseFactory
    this._vm = vm
    this._port = port
  }

  start() {
    const app = this._webServerFactory()

    app.post('/do', (req, res) => {
      assert.notStrictEqual(null, req.body.command);
      assert.notStrictEqual(undefined, req.body.command);
      assert.notStrictEqual('', req.body.command);

      assert.notStrictEqual(null, req.body.taskId);
      assert.notStrictEqual(undefined, req.body.taskId);
      assert.notStrictEqual('', req.body.taskId);

      function onTaskStartNotified() {
        this._logger.info('Worker done notifying nest of task start.');

        const done = () => {
          this._requestPromiseFactory({
            method: 'PUT',
            uri: 'http://localhost:3002/api/v1/task/done',
            body: {
              taskId: req.body.taskId
            },
            json: true
          }).then(() => {
            this._logger.info('Worker done notifying nest.')
          }).catch(() => {
            this._logger.error('Worker could not notify nest.')
          });
        }

        const sandbox = {
          globalVar: 1,
          done: done,
          console: console,
          exec: exec,
          assert: assert
        };

        this._vm.createContext(sandbox);

        this._vm.runInContext(req.body.command, sandbox);
      }

      this._requestPromiseFactory({
        method: 'PUT',
        uri: 'http://localhost:3002/api/v1/task/started',
        body: {
          taskId: req.body.taskId
        },
        json: true
      })
        .then(onTaskStartNotified.bind(this))
        .catch(() => {
          this._logger.error('Worker could not notify nest of task start.')
        })

      res.send({ 'status': 'success' });
    })

    app.listen(this._port, () => {
      this._logger.info('Worker listening.', { port: this._port })
    })
  }
}

export default WorkerService