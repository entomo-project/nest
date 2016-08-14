import React from 'react'
import { Router, Route, IndexRedirect } from 'react-router'
import AppLayout from './AppLayout'
import TaskList from './Task/TaskList'
import TaskDetail from './Task/TaskDetail'
import TaskLauncher from './Task/TaskLauncher'

export default (props) => {
  return (
    <Router history={props.history}>
      <Route path="/" component={AppLayout}>
        <IndexRedirect to="/task" />
        <Route path="task" component={TaskList.bind(undefined, props.store)} />
        <Route path="task/:id" component={TaskDetail} />
        <Route path="task/launch" component={TaskLauncher} />
      </Route>
    </Router>
  )
}