const makeApp = require('../../../built/task-api/make-app').default

const Promise = require('bluebird')
const chai = require('chai')
const expect = chai.expect
const ObjectID = require('mongodb').ObjectID
const testTimeService = require('../test-time-service')

describe('Task API', function() {
  this.slow(250)

  let server
  let container
  let mongoClient

  before(function() {
    return makeApp('test')
      .then((localContainer) => {
        container = localContainer

        container.set('app.service.time', testTimeService)

        mongoClient = container.get('app.service.mongo.client')
        const serverService = container.get('app.service.server')

        return Promise.all([
          serverService.start().then((localServer) => {
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

  describe('POST /api/task', function() {
    it('should create given task', function(done) {
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

                  expect(results[0]._id).to.be.instanceOf(ObjectID)

                  expect(results[0].meta).to.deep.equal({ components: [ 'base', 'commandBased' ] })

                  expect(results[0].data).to.have.all.keys([
                    'command',
                    'createdBy',
                    'createdAt',
                    'type'
                  ])

                  expect(results[0].data.command).to.be.equal('echo \'test\'')
                  expect(results[0].data.createdBy).to.be.equal('bmichalski')
                  expect(results[0].data.createdAt.getTime()).to.be.equal(testTimeService.getNowDate().getTime())
                  expect(results[0].data.type).to.be.equal('foobar')

                  done()
                })
              })
          })
      })
    })
  })

  describe('GET /api/task/:id', function() {
    it('should return task with id', function(done) {
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

    it('should return a 404 if task does not exists', function(done) {
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