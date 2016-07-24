import { MongoClient as RawMongoClient } from 'mongodb'
import assert from 'assert'
import Promise from 'promise'

class MongoClient {
  constructor(logger, url) {
    assert.notStrictEqual(null, url)
    assert.notStrictEqual('', url)
    assert.notStrictEqual(undefined, url)

    this._logger = logger
    this._url = url
    this._db = null
  }

  connect(databaseName) {
    assert.notStrictEqual(null, databaseName)
    assert.notStrictEqual('', databaseName)
    assert.notStrictEqual(undefined, databaseName)

    const fullUrl = this._url + '/' + databaseName

    return new Promise(
      (resolve) => {
        if (null === this._db) {
          this._logger.debug('Instanciating new connection.')

          RawMongoClient.connect(fullUrl, { promiseLibrary: Promise }, (err, db) => {
            assert.equal(null, err)

            this._db = db

            this._logger.debug('Done instanciating new connection.')

            resolve(this._db)
          })
        } else {
          this._logger.debug('Reusing previous connection.')

          resolve(this._db)
        }
      }
    )
  }

  collection(databaseName, collectionName) {
    assert.notStrictEqual(null, databaseName)
    assert.notStrictEqual('', databaseName)
    assert.notStrictEqual(undefined, databaseName)

    assert.notStrictEqual(null, collectionName)
    assert.notStrictEqual('', collectionName)
    assert.notStrictEqual(undefined, collectionName)

    return new Promise(
      (resolve) => {
        this.connect(databaseName).then((db) => {
          db.collection(collectionName, (err, collection) => {
            assert.equal(null, err)

            resolve(collection)
          })
        })
      }
    )
  }
}

export default MongoClient