var MongoCollection = function (db) {
  this.db = db
}

MongoCollection.prototype = {
  db: null
}

MongoCollection.prototype.getCollection = function (name, options, callback) {        
  return this.db.collection(name, options, function (err, collection) {
    console.log(err, collection)
  })
}

exports.MongoCollection = MongoCollection