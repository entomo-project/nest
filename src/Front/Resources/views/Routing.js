import React from 'react'
import { Router, Route, IndexRedirect } from 'react-router'
import AppLayout from './AppLayout'
import TaskDetail from './Task/TaskDetail'
import TableWrapper from './TableWrapper'

export default (props) => {
  return (
    <Router history={props.history}>
      <Route path="/" component={AppLayout}>
        <IndexRedirect to="/task" />
        <Route path="task" component={TableWrapper} />
        <Route path="task/:id" component={TaskDetail} />
      </Route>
    </Router>
  )
}