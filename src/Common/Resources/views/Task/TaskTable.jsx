import React from 'react'
import rp from 'request-promise'
import { browserHistory } from 'react-router'

class TaskRow extends React.Component {
  constructor(props) {
    super(props)
  }

  handleClick(taskId) {
    browserHistory.push('/task/' + taskId)
  }

  render() {
    const task = this.props.task

    return (
      <tr onClick = { this.handleClick.bind(this, task._id) }>
        <td>{ task.data.taskTypeName }</td>
        <td>{ task.data.createdAt }</td>
        <td>{ task.data.startedAt }</td>
        <td>{ task.data.stoppedAt }</td>
        <td>{ task.data.createdBy }</td>
        <td>{ task.data.maxDuration }</td>
      </tr>
    )
  }
}

class TaskTable extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      tasks: []
    }
  }

  componentDidMount() {
    var page,
      pageSize

    const rawPage = this.props.page
    const rawPageSize = this.props.pageSize

    if (undefined === rawPage) {
      page = 1
    } else {
      page = parseInt(rawPage, 10)
    }

    if (undefined === rawPageSize) {
      pageSize = 10
    } else {
      pageSize = parseInt(rawPageSize, 10)
    }

    const from = (1 - page) * pageSize
    const limit = pageSize

    rp({
      uri: 'http://dockerhost:3000/api/v1/task',
      json: true,
      qs: {
        from: from,
        limit: limit
      }
    }).then((tasks) => {
      this.setState({
        tasks: tasks
      })
    })
  }

  render() {
    const rows = []

    var table

    if (this.state.tasks.length > 0) {
      this.state.tasks.forEach(function (task) {
        rows.push(
          <TaskRow key = { task._id } task = { task } />
        )
      })

      table = <table className="table table-striped table-hover table-condensed">
        <thead>
        <tr>
          <th>Task type name</th>
          <th>Created at</th>
          <th>Started at</th>
          <th>Stopped at</th>
          <th>Created by</th>
          <th>Max duration</th>
        </tr>
        </thead>
        <tbody>
        {rows}
        </tbody>
      </table>
    } else {
      table = <div>No task</div>
    }

    return (table)
  }
}

export default TaskTable