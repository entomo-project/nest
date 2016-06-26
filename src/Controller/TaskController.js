'use strict';
    
var React = require('react');
var ReactDOMServer = require('react-dom/server');
var taskList = require(__dirname + '/../../dist/Task/TaskList');
var rp = require('request-promise');

function makeJsonGetCall(uri) {
  var options = {
    uri: uri,
    json: true
  };

  return rp(options);
}

var taskListFactory = React.createFactory(taskList.default);

function registerController(app) {

  app.get('/task', function (req, res) {
    makeJsonGetCall('http://localhost:3000/api/v1/task').then(function (tasks) {
      res.send(
        ReactDOMServer.renderToString(
          taskListFactory({ tasks: tasks })
        )
      );
    });
  });
  
  app.get('/', function (req, res) {
    res.redirect('/task');
  });
}

exports.register = registerController;