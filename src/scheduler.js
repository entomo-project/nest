'use strict';

const port = 3002

const express = require('express')
const bodyParser = require('body-parser')

const MongoClient = require(__dirname + '/Mongo/MongoClient').MongoClient
const assert = require('assert')
const rp = require('request-promise')

const url = 'mongodb://mongo:27017'

const logger = require(__dirname + '/Service/Logger').createLogger();
const ObjectID = require('mongodb').ObjectID;

const mongoClient = new MongoClient(url)

var elementsInQueue = 0
const queue = {}

const queueSize = 4

logger.level = 'debug';

const app = express();
app.use(bodyParser.json());

function addToQueueIfPossible(task) {
  const _id = task._id

  if (undefined === queue[_id] && elementsInQueue < queueSize) {
    logger.info('Adding a task to the queue.', { task: { _id: _id.toString() } })

    queue[_id] = task
    elementsInQueue += 1

    logger.info('Notifying worker.');

    rp({
      method: 'POST',
      uri: 'http://localhost:3003/do',
      body: {
        taskId: _id,
        command: 'console.log(\'oui mon seigneur\'); done();'
      },
      json: true
    }).then(function () {
      logger.info('Worker notified.');
    }).catch(function () {
      logger.error('Could not notify worker.');
    });
  } else {
    // logger.debug('Task queue is full.')
  }
}

function removeTaskFromQueue(taskId) {
  delete queue[taskId];
  elementsInQueue -= 1
}

function main() {
  mongoClient
    .collection('nest', 'task')
    .then(function (collection) {
     collection
       .find({ 'meta.components.': 'commandBased', 'data.startedAt': null })
       .toArray(function(err, docs) {
         assert.strictEqual(null, err);

         docs.forEach(function (doc) {
           addToQueueIfPossible(doc)
         });
       })
     ;
    })
  ;
}

setInterval(main, 1000);

function taskStarted(req, res) {
  assert.notStrictEqual(null, req.body.taskId)
  assert.notStrictEqual(undefined, req.body.taskId)
  assert.notStrictEqual('', req.body.taskId)

  logger.info('Notified by scheduler that task has started.', { _id: req.body.taskId });

  mongoClient
    .collection('nest', 'task')
    .then(function (collection) {
      collection
        .update({ _id: ObjectID(req.body.taskId) }, { $set: { 'data.startedAt': new Date() } })
        .then(function() {
          logger.info('Marked task as started.', { _id: req.body.taskId });

          res.send({ status: 'success' })
        })
    })
}

function taskDone(req, res) {
  const taskId = req.body.taskId

  assert.notStrictEqual(null, taskId)
  assert.notStrictEqual(undefined, taskId)
  assert.notStrictEqual('', taskId)

  logger.info('Notified by worker that task is done.', { _id: taskId });

  mongoClient
    .collection('nest', 'task')
    .then(function (collection) {
      collection
        .update({ _id: ObjectID(taskId) }, { $set: { 'data.stoppedAt': new Date() } })
        .then(function() {
          logger.info('Marked task as done.', { _id: taskId });

          removeTaskFromQueue(taskId)

          res.send({ status: 'success' })
        })
    })
}

app.put('/api/v1/task/started', taskStarted)
app.put('/api/v1/task/done', taskDone)

app.listen(port, function () {
  logger.info('Scheduler listening.', { port: port });
});