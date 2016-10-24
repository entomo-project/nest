const kernel = require('../../built/task-api/task-api-kernel').default
const BaseApp = require('../../built/common/base-app').default

const Promise = require('bluebird')
const chai = require('chai')
const expect = chai.expect
const ObjectID = require('mongodb').ObjectID

describe('Task API', () => {
  let server
  let container
  let mongoClient

  before(() => {
    const app = new BaseApp(kernel)

    return app
      .init()
      .then((localContainer) => {
        container = localContainer

        mongoClient = container.get('app.service.mongo.client')
        const publicApi = container.get('app.service.task_api')

        return Promise.all([
          publicApi.start().then((localServer) => {
            server = localServer
          }),
          mongoClient.connect('nest').then((db) => {
            return new Promise((resolve) => {
              db.dropDatabase().then(() => {
                resolve()
              })
            })
          })
        ])
      })
  })

  describe('POST /api/task', () => {
    it('should create given task', (done) => {
      server.inject({
        method: 'POST',
        url: '/api/task',
        payload: {
          components: [ 'commandBased' ],
          command: "echo 'test'",
          createdBy: 'bmichalski',
          type: 'foobar'
        }
      }).then((res) => {
        expect(res.statusCode).to.equal(200)
        expect(res.result).to.deep.equal({ status: 'success' })

        mongoClient
          .collection('nest', 'task')
          .then((collection) => {
            collection
              .find({}, (err, iterator) => {
                if (null !== err) {
                  throw err
                }

                iterator.toArray().then((results) => {
                  expect(results).to.have.lengthOf(1)

                  expect(results[0]).to.have.all.keys([
                    '_id',
                    'meta',
                    'data'
                  ])

                  //TODO
                  //expect(results[0]._id).to.be.equal(results[0]._id)

                  expect(results[0].meta).to.deep.equal({ components: [ 'base', 'commandBased' ] })

                  expect(results[0].data).to.have.all.keys([
                    'command',
                    'createdBy',
                    'createdAt',
                    'type'
                  ])

                  expect(results[0].data.command).to.be.equal('echo \'test\'')
                  expect(results[0].data.createdBy).to.be.equal('bmichalski')
                  //TODO
                  // expect(results[0].data.createdAt).to.be.equal(results[0].createdAt)
                  expect(results[0].data.type).to.be.equal('foobar')

                  done()
                })
              })
          })
      })
    })
  })

  describe('GET /api/task/:id', () => {
    it('should return task with id', (done) => {
      mongoClient
        .collection('nest', 'task')
        .then((collection) => {
          const objectId = ObjectID()

          collection
            .insertOne(
              {
                _id: objectId,
                foo: 'bar'
              },
              (err) => {
                if (err) {
                  throw err
                }

                const url = '/api/task/' + objectId

                server.inject({
                  method: 'GET',
                  url: url
                }).then((res) => {
                  expect(res.statusCode).to.equal(200)
                  expect(res.result).to.have.keys([
                    'status',
                    'result'
                  ])

                  expect(res.result.result).to.have.keys([
                    '_id',
                    'foo'
                  ])

                  expect(res.result.status).to.equal('success')

                  expect(res.result.result._id.toString()).to.equal(objectId.toString())
                  expect(res.result.result.foo).to.equal('bar')

                  done()
                })
              }
            )
        })
    })

    it('should return a 404 if task does not exists', (done) => {
      const objectId = ObjectID()

      const url = '/api/task/' + objectId

      server.inject({
        method: 'GET',
        url: url
      }).then((res) => {
        expect(res.statusCode).to.equal(404)
        expect(res.result).to.be.deep.equal({ status: 'not_found' })

        done()
      })
    })
  })
})