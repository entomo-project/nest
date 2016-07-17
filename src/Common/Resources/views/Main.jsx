import React from 'react'
import { Router, Route, browserHistory, IndexRedirect } from 'react-router'
import App from './App'
import TaskList from './Task/TaskList'
import TaskDetail from './Task/TaskDetail'
import TaskLauncher from './Task/TaskLauncher'

class Main extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <Router history = { browserHistory }>
        <Route path = "/" component = { App }>
          <IndexRedirect to="/task" />
          <Route path = "task" component = { TaskList } />
          <Route path = "task/:id" component = { TaskDetail } />
          <Route path = "task/launch" component = { TaskLauncher } />
        </Route>
      </Router>
    )
  }
}

export default Main