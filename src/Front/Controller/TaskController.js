import React from 'react'
import ReactDOMServer from 'react-dom/server'
import taskList from  '../../Common/Resources/views/Task/TaskList'
import taskLauncher from  '../../Common/Resources/views/Task/TaskLauncher'
import rp from 'request-promise'

function makeJsonGetCall(uri) {
  var options = {
    uri: uri,
    json: true
  };

  return rp(options);
}

const taskListFactory = React.createFactory(taskList);
const taskLauncherFactory = React.createFactory(taskLauncher);

class TaskController {
  register(app) {
    app.get('/task/launch', function (req, res) {
      res.send(
        ReactDOMServer.renderToString(
          taskLauncherFactory()
        )
      )
    });

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