import { MongoClient as RawMongoClient } from 'mongodb'
import assert from 'assert'
import Promise from 'promise'

class MongoClient {
  constructor(url) {
    assert.notStrictEqual(null, url)
    assert.notStrictEqual('', url)
    assert.notStrictEqual(undefined, url)

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
          RawMongoClient.connect(fullUrl, { promiseLibrary: Promise }, (err, db) => {
            assert.equal(null, err)

            this._db = db

            resolve(this._db)
          })
        } else {
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