import React from 'react'
import TaskTable from './TaskTable'

class TaskList extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-12">
            <TaskTable />
          </div>
        </div>
      </div>
    )
  }
}

export default TaskList