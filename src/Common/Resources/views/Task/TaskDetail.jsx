import { js_beautify as jsbeautify } from 'js-beautify'
import React from 'react'
import { Link } from 'react-router'
import rp from 'request-promise'
import TaskHelper from './TaskHelper'

class TaskDetail extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      task: null,
      taskAsString: ''
    }
  }

  componentDidMount() {
    const taskId = this.props.routeParams.id

    this.setState({
      task: {
        _id: taskId
      },
      taskAsString: ''
    })

    rp({
      uri: 'http://dockerhost:3000/api/v1/task/' + taskId,
      json: true,
    }).then((task) => {
      const beautified = jsbeautify(JSON.stringify(task), { indent_size: 2 })

      this.setState({
        task: task,
        taskAsString: beautified
      })
    })
  }

  render() {
    return (
      () => {
        if (null === this.state.task) {
          return (<div>Loading ...</div>)
        }

        return (
          <div className="container-fluid">
            <div className="row">
              <div className="col-md-12">
                <div className="btn-group">
                  <Link className="btn btn-default" to="/task">Back to the list</Link>
                </div>
              </div>
            </div>
            <hr />
            {(
              () => {
                const task = this.state.task

                const taskClassName = TaskHelper.getTaskClassName(task)

                if ('has-error' === taskClassName) {
                  return (
                    <div className="row">
                      <div className="col-md-12">
                        <div className="alert alert-danger">
                          <i className="fa fa-warning" />&nbsp;
                          This task has ended with an error.
                        </div>
                      </div>
                    </div>
                  )
                } else if ('has-warning' === taskClassName) {
                  return (
                    <div className="row">
                      <div className="col-md-12">
                        <div className="alert alert-warning">
                          <i className="fa fa-warning" />&nbsp;
                          This task may not have ended as expected.
                        </div>
                      </div>
                    </div>
                  )
                } else if (null !== task.data.stoppedAt) {
                  return (
                    <div className="row">
                      <div className="col-md-12">
                        <div className="alert alert-success">
                          <i className="fa fa-check" />&nbsp;
                          This task has ended with success.
                        </div>
                      </div>
                    </div>
                  )
                } else {
                  return (
                    <div className="row">
                      <div className="col-md-12">
                        <div className="alert alert-info">
                          <i className="fa fa-question-circle" />&nbsp;
                          This task hasn't started yet.
                        </div>
                      </div>
                    </div>
                  )
                }
              }
            )()}
            <div className="row">
              <div className="col-md-12">
                <pre>
                  { this.state.taskAsString }
                </pre>
              </div>
            </div>
          </div>
        )
      }
    )()
  }
}

export default TaskDetail