import React from 'react'
import TaskTable from './TaskTable'
import { Link } from 'react-router'

class TaskList extends React.Component {
  render() {
    const page = this.props.location.query.page === undefined ? 1 : parseInt(this.props.location.query.page, 10)
    const pageSize = this.props.location.query.pageSize === undefined ? 10 : parseInt(this.props.location.query.pageSize, 10)

    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-12">
            <TaskTable page={ page } pageSize={ pageSize } />
          </div>
        </div>
      </div>
    )
  }
}

export default TaskList