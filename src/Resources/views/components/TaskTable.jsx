'use strict';

import React from 'react'

class TaskRow extends React.Component {
  constructor(props) {
    super(props);
  }

  handleClick() {
    console.log('clicked')
  }

  render() {
    const task = this.props.task;

    return (
      <tr onClick={this.handleClick}>
        <td>{ task._id }</td>
        <td>{ JSON.stringify(task.meta.components) }</td>
        <td>{ task.data.createdAt }</td>
        <td>{ task.data.createdBy }</td>
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
      <table className="table table-striped table-hover table-condensed">
        <thead>
          <tr>
            <th>Id</th>
            <th>Composed of</th>
            <th>Created at</th>
            <th>Created by</th>
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