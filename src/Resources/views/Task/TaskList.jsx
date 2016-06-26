'use strict';

import React from 'react'
import Layout from '../Layout'
import TaskTable from '../components/TaskTable'

class TaskList extends Layout {
  constructor(props) {
    super(props);
  }
  renderBody() {
    return (
      <TaskTable tasks={this.props.tasks} />
    );
  }
}

export default TaskList