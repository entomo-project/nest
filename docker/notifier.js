const assert = require('assert')
const notifier = require('node-notifier')
const path = require('path');

const express = require('express')

const bodyParser = require('body-parser')
const timeout = require('connect-timeout')

function haltOnTimedout(req, res, next){
  if (!req.timedout) next();
}

const app = express();

app.use(timeout('5s'));
app.use(bodyParser.json());
app.use(haltOnTimedout);

app.post('/notify', function (req, res) {
  assert.notStrictEqual(undefined, req.body.title)
  assert.notStrictEqual(undefined, req.body.message)

  notifier.notify({
    title: req.body.title,
    message: req.body.message
  }, function (err) {
    if (err) {
      //TODO log error
      res.send({ 'status': 'error' })
    } else {
      res.send({ 'status': 'success' })
    }
  })
})

app.listen(3333, function () {
  console.log('Local notifier listening on port 3333.')
})
