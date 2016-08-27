import React from 'react'
import { Router, Route, IndexRedirect } from 'react-router'
import AppLayout from './AppLayout'
import TaskDetail from './Task/TaskDetail'
import TableWrapper from './TableWrapper'

export default (routingProps) => {
  const withPublicApi = (Component) => {
    return (props) => {
      return (
        <Component {...props} publicApi={routingProps.publicApi} />
      )
    }
  }

  return (
    <Router history={routingProps.history}>
      <Route path="/" component={AppLayout}>
        <IndexRedirect to="/task" />
        <Route path="task" component={withPublicApi(TableWrapper)} />
        <Route path="task/:id" component={withPublicApi(TaskDetail)} />
      </Route>
    </Router>
  )
}