import React from 'react'
import rp from 'request-promise'
import { browserHistory } from 'react-router'
import TaskHelper from './TaskHelper'

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
      <tr onClick={this.handleClick.bind(this, task._id)} className={TaskHelper.getTaskClassName(task)}>
        <td>{
          (() => {
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
          })()
        }</td>
        <td>{ task.data.taskTypeId }</td>
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

  _updateTasks(page, pageSize) {
    const from = (page - 1) * pageSize
    const limit = pageSize

    rp({
      uri: 'http://dockerhost:3000/api/v1/task',
      json: true,
      qs: {
        from: from,
        limit: limit
      }
    }).then((data) => {
      this.setState({
        tasks: data.result,
        totalPages: Math.ceil(data.info.total / pageSize)
      })
    })
  }

  componentWillReceiveProps(newProps) {
    this._updateTasks(
      newProps.page,
      newProps.pageSize
    )
  }

  componentWillMount() {
    this._updateTasks(
      this.props.page,
      this.props.pageSize
    )
  }

  render() {
    const rows = []

    var table

    if (this.state.tasks.length > 0) {
      this.state.tasks.forEach((task) => {
        rows.push(
          <TaskRow key = { task._id } task = { task } />
        )
      })

      table = <table className="table table-hover table-condensed">
        <thead>
        <tr>
          
        </tr>
        </thead>
        <tbody>
        {rows}
        </tbody>
      </table>
    } else {
      table = <div>No task</div>
    }

    return (
      <div>
        <Paginator totalPages={this.state.totalPages} currentPage={this.props.page} pageSize={this.props.pageSize} />
        {table}
        <Paginator totalPages={this.state.totalPages} currentPage={this.props.page} pageSize={this.props.pageSize} />
      </div>
    )
  }
}

export default TaskTable