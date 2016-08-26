import React from 'react'
import { Table } from '@bmichalski-react/table'
import request from 'superagent-bluebird-promise'
import { withRouter } from 'react-router'
import Promise from 'bluebird'
import TaskHelper from '../Resources/views/Task/TaskHelper'

let idsByRowIndex = {}

const TableWrapper = (props) => {
  const opts = {
    sort: {
      sortableColumns: [
        'id',
        'firstColumn'
      ]
    },
    table: {
      className: 'table table-bordered',
      head: {
        rows: [
          {
            cells: [
              {
                name: 'status',
                type: 'HEADING',
                content: ''
              },
              {
                name: 'taskTypeId',
                type: 'HEADING',
                content: 'Task type id'
              },
              {
                name: 'createdAt',
                type: 'HEADING',
                content: 'Created at'
              },
              {
                name: 'startedAt',
                type: 'HEADING',
                content: 'Started at'
              },
              {
                name: 'stoppedAt',
                type: 'HEADING',
                content: 'Stopped at'
              },
              {
                name: 'createdBy',
                type: 'HEADING',
                content: 'Created by'
              },
              {
                name: 'maxDuration',
                type: 'HEADING',
                content: 'Max duration'
              }
            ]
          }
        ]
      }
    },
    parseData: {
      updateBodys: (data) => {
        const rows = []

        data.result.forEach((resultRow) => {
          const row = {
            cells: []
          }

          resultRow.forEach((resultCell) => {
            row.cells.push({
              props: {
                className: 'clickable',
                onClick: (event) => {
                  event.preventDefault()

                  const str = JSON.stringify(row)

                  console.log(str)
                }
              },
              content: resultCell.content
            })
          })

          rows.push(row)
        })

        return [
          {
            rows: rows
          }
        ]
      }
    },
    asyncData: {
      fetchData: (opts) => {
        const loadingDelay = props.loadingDelay

        if (opts.page === undefined) {
          opts.page = 1
        }

        if (opts.pageSize === undefined) {
          opts.pageSize = 10
        }

        if (opts.q === undefined) {
          opts.q = ''
        }

        const { page, pageSize, q, sort } = opts

        const from = (page - 1) * pageSize
        const end = from + pageSize

        return new Promise((resolve, reject, onCancel) => {
          request
            .get('http://localhost:3000/api/v1/task')
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
      }
    }
  }

  opts.routing = {
    location: props.location,
    router: props.router
  }

  return (
    <div>
      <style contentStyleType="text/css">
        {'table > tbody > tr > td.clickable {cursor: pointer;}'}
      </style>
      <Table
        opts={opts}>
      </Table>
    </div>
  )
}

TableWrapper.propTypes = {
  loadingDelay: React.PropTypes.number.isRequired
}

TableWrapper.defaultProps = {
  loadingDelay: 200
}

export default withRouter(TableWrapper)
