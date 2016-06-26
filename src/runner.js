'use strict';

var MongoClient = require(__dirname + '/Mongo/MongoClient').MongoClient;
var assert = require('assert');

var url = 'mongodb://mongo:27017';

var mongoClient = new MongoClient(url);

function main() {
  mongoClient
    .collection('nest', 'task')
    .then(function (collection) {
      collection
        .find()
        .toArray(function(err, docs) {
          assert.strictEqual(null, err);

          docs.forEach(function (doc) {
            collection.updateOne({ _id: doc._id }, { $set: { 'data.maxDuration': 42 } });
          });
        })
      ;
    })
  ;
}

setInterval(main, 1000);