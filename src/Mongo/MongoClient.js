'use strict';

var RawMongoClient = require('mongodb').MongoClient;
    
var assert = require('assert');
var Promise = require('promise');

var MongoClient = function (url) {
  assert.notStrictEqual(null, url);
  assert.notStrictEqual('', url);
  assert.notStrictEqual(undefined, url);

  this.url = url;
};

MongoClient.prototype = {
  connectedOnce: false,
  url: null
};

MongoClient.prototype.connect = function (databaseName) {
  assert.notStrictEqual(null, databaseName);
  assert.notStrictEqual('', databaseName);
  assert.notStrictEqual(undefined, databaseName);

  var that = this;
  var fullUrl = that.url + '/' + databaseName;

  return new Promise(
    function (resolve) {                
      RawMongoClient.connect(fullUrl, function(err, db) {
        assert.equal(null, err);

        that.connectedOnce = true;

        resolve(db);
      });
    }
  );
};

MongoClient.prototype.collection = function (databaseName, collectionName) {
  assert.notStrictEqual(null, databaseName);
  assert.notStrictEqual('', databaseName);
  assert.notStrictEqual(undefined, databaseName);

  assert.notStrictEqual(null, collectionName);
  assert.notStrictEqual('', collectionName);
  assert.notStrictEqual(undefined, collectionName);

  var that = this;

  return new Promise(
    function (resolve) {                
      that.connect(databaseName).then(function (db) {
        db.collection(collectionName, function (err, collection) {
          assert.equal(null, err);

          resolve(collection);
        });
      });
    }
  );
}; 

exports.MongoClient = MongoClient;