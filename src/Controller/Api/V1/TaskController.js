(function () {
    'use strict';
    
    var MongoClient = require(__dirname + '/../../../Mongo/MongoClient').MongoClient;
    var TaskBuilder = require(__dirname + '/../../../Task/TaskBuilder').TaskBuilder;
    var url = 'mongodb://mongo:27017';
    var mongoClient = new MongoClient(url);
    var assert = require('assert');
    var taskBuilder = new TaskBuilder();
    
    function registerController(app) {
        app.put('/api/v1/task', function (req, res) {
            assert.notStrictEqual(null, req.body.components);
            assert.notStrictEqual(undefined, req.body.components);
            assert(req.body.components instanceof Array && req.body.components.length > 0);
            
            var task = taskBuilder.buildTask();
            
            mongoClient
                .collection('nest', 'task')
                .then(function (collection) {            
                    collection
                        .insertOne(task)
                        .then(function() {
                            res.send({ status: 'success' });
                        })
                    ;
                })
            ;
        });

        app.get('/api/v1/task/:id', function (req, res, id) {
            mongoClient
                .collection('nest', 'task')
                .then(function (collection) {            
                    collection
                        .findOne({ '_id': id })
                        .then(function(doc) {
                            if (null === doc) {
                                res.status(404).send({ status: 'not_found' });
                            } else {
                                res.send(doc);
                            }
                        })
                    ;
                })
            ;
        });

        app.get('/api/v1/task', function (req, res) {
            mongoClient
                .collection('nest', 'task')
                .then(function (collection) {            
                    collection.find().toArray(function(err, docs) {
                        assert.strictEqual(null, err);

                        res.send(docs);
                    });
                })
            ;
        });
    }
    
    exports.register = registerController;
}());