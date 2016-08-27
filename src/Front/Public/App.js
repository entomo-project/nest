import React from 'react'
import { render } from 'react-dom'
import Promise from 'bluebird'
import { browserHistory } from 'react-router'
import Routing from '../Resources/views/Routing'
import PublicApi from '../Service/PublicApi'
import nestConfig from 'nestConfig' //external

const publicApi = new PublicApi(nestConfig.publicApi.baseUrl)

Promise.config({
  warnings: true,
  longStackTraces: true,
  cancellation: true
})

render(
  (
    <Routing history={browserHistory} publicApi={publicApi} />
  ),
  document.getElementById('app-container')
)

