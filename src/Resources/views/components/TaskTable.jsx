'use strict';

import React from 'react'

class TaskRow extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const task = this.props.task;

    return (
      <tr>
        <td>{ task._id }</td>
        <td>{ JSON.stringify(task.meta.components) }</td>
        <td>{ task.data.startedAt }</td>
        <td>{ task.data.stoppedAt }</td>
        <td>{ task.data.maxDuration }</td>
        <td>{ task.data.typeName }</td>
      </tr>
    );
  }
}

class TaskTable extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const rows = [];

    this.props.tasks.forEach(function (task) {
      rows.push(
        <TaskRow task={task} />
      );
    });

    return (
      <table class="table table-bordered">
        <thead>
          <tr>
            <th>Id</th>
            <th>Composed of</th>
            <th>Started at</th>
            <th>Stopped at</th>
            <th>Max duration</th>
            <th>Task type name</th>
          </tr>
        </thead>
        <tbody>
          {rows}
        </tbody>
      </table>
    );
  }
}

export default TaskTable