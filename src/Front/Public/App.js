import React from 'react'
import { render } from 'react-dom'
import Routing from  '../Resources/views/Routing'
import { makeTableWrapper } from '@bmichalski-react/table'
import Promise from 'bluebird'
import request from 'superagent-bluebird-promise'
import TaskHelper from '../Resources/views/Task/TaskHelper'
import { takeEvery } from 'redux-saga'
import ActionType from '../../../node_modules/@bmichalski-react/table/dist/js/Action/Type/ActionType'
import { put } from 'redux-saga/effects'

let idsByRowIndex = {}

function getSagas() {
  function *updateBodyRowsOnDataUpdateSaga() {
    yield takeEvery(ActionType.UPDATE_DATA, function *(action) {
      const rows = {}

      console.log(action)

      action.data.forEach((data, i) => {
        const cells = {}

        data.forEach((data, i) => {
          cells[i] = {
            className: 'clickable'
          }
        })

        rows[i] = {
          className: 'bazqux-row-class',
          cells
        }
      })

      yield put({
        type: ActionType.UPDATE_BODY_ROWS,
        rows
      })
    })
  }

  function *onTableBodyCellClicked() {
    yield takeEvery(ActionType.TABLE_BODY_CELL_CLICKED, (action) => {
      const str = JSON.stringify(action)

    })
  }

  return [
    updateBodyRowsOnDataUpdateSaga(),
    onTableBodyCellClicked()
  ]
}

const opts = {
  getSagas: getSagas,
  // onCellClicked: (row, cellIndex, rowIndex) => {
  //   const taskId = idsByRowIndex[rowIndex]
  //
  //   browserHistory.push('/task/' + taskId)
  // },
  getData: (opts) => {
    const { page, pageSize, q, sort } = opts

    const from = (page - 1) * pageSize

    return new Promise((resolve) => {
      request
        .get('http://dockerhost:3000/api/v1/task')
        .query({
          from: from,
          limit: pageSize
        }).then((res) => {
        const body = res.body

        const rows = []

        function makeStatusContent(task) {
          const taskClassName = TaskHelper.getTaskClassName(task)

          if ('has-error' === taskClassName) {
            return (
              <i className="fa fa-warning" />
            )
          } else if ('has-warning' === taskClassName) {
            return (
              <i className="fa fa-warning" />
            )
          } else if (null !== task.data.stoppedAt) {
            return (
              <i className="fa fa-check" />
            )
          }
        }

        idsByRowIndex = {}

        body.result.forEach((result, i) => {
          const statusContent = makeStatusContent(result)

          idsByRowIndex[i] = result._id

          const row = [
            {
              content: statusContent
            },
            {
              content: result.data.taskTypeId
            },
            {
              content: result.data.createdAt
            },
            {
              content: result.data.startedAt
            },
            {
              content : result.data.stoppedAt
            },
            {
              content: result.data.createdBy
            },
            {
              content: result.data.maxDuration
            }
          ]

          rows.push(row)
        })

        resolve({
          result: rows,
          info: {
            total: body.info.total,
            filteredTotal: body.info.filteredTotal
          }
        })
      })
    })
  },
  renderCell: (data) => {
    return data.content
  }
}

makeTableWrapper(opts, (browserHistory, store) => {
  render(
    (
      <Routing history={browserHistory} store={store} />
    ),
    document.getElementById('app-container')
  )
})
