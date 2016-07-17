import { js_beautify as jsbeautify } from 'js-beautify'
import React from 'react'
import { Link } from 'react-router'
import rp from 'request-promise'

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
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-12">
            <div className="btn-group">
              <Link className="btn btn-default" to="/task">Back to the list</Link>
            </div>
          </div>
        </div>
        <hr />
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
}

export default TaskDetail