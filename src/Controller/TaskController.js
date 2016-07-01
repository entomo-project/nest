'use strict';

import React from 'react'
import ReactDOMServer from 'react-dom/server'
import taskList from  '../Resources/views/Task/TaskList'
import rp from 'request-promise'

function makeJsonGetCall(uri) {
  var options = {
    uri: uri,
    json: true
  };

  return rp(options);
}

const taskListFactory = React.createFactory(taskList);

class TaskController {
  register(app) {
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
}

export default TaskController;