import React from 'react'
import { render } from 'react-dom'
import Promise from 'bluebird'
import { browserHistory } from 'react-router'
import Routing from '../Resources/views/Routing'

Promise.config({
  warnings: true,
  longStackTraces: true,
  cancellation: true
})

render(
  (
    <Routing history={browserHistory} />
  ),
  document.getElementById('app-container')
)

