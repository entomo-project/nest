import React from 'react'
import ReactDOMServer from 'react-dom/server'
import taskList from  '../../Common/Resources/views/Task/TaskList'
import taskLauncher from  '../../Common/Resources/views/Task/TaskLauncher'
import rp from 'request-promise'

function makeJsonGetCall(uri, qs) {
  var options = {
    uri: uri,
    json: true,
    qs: qs
  };

  return rp(options);
}

const taskListFactory = React.createFactory(taskList);
const taskLauncherFactory = React.createFactory(taskLauncher);

class TaskController {
  register(app) {
    function launchTask(req, res) {
      if ('POST' === req.method) {
        console.log(res)
      }

      res.send(
        ReactDOMServer.renderToString(
          taskLauncherFactory()
        )
      )
    }

    app.get('/task/launch', launchTask);
    app.post('/task/launch', launchTask);

    app.get('/task', function (req, res) {
      var page,
        pageSize

      if (undefined === req.query.page) {
        page = 1
      } else {
        page = parseInt(req.query.page, 10)
      }

      if (undefined === req.query.pageSize) {
        pageSize = 10
      } else {
        pageSize = parseInt(req.query.pageSize, 10)
      }

      const from = (1 - page) * pageSize
      const limit = pageSize

      makeJsonGetCall(
        'http://localhost:3000/api/v1/task',
        {
          from: from,
          limit: limit
        }
      ).then(function (tasks) {
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