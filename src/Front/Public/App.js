import React from 'react'
import { render } from 'react-dom'
import Promise from 'bluebird'
import TableWrapper from './TableWrapper'
import { Router, Route, browserHistory } from 'react-router'



Promise.config({
  warnings: true,
  longStackTraces: true,
  cancellation: true
})

render(
  (
    <Router history={browserHistory}>
      <Route path="/" component={TableWrapper}>
        <Route path="*" component={TableWrapper} />
      </Route>
    </Router>
  ),
  document.getElementById('app-container')
)

// makeTableWrapper(opts, (browserHistory, store) => {
//   render(
//     (
//       <Routing history={browserHistory} store={store} />
//     ),
//     document.getElementById('app-container')
//   )
// })
