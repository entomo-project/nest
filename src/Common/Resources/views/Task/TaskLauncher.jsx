import React from 'react'
import Layout from '../Layout'

class TaskLauncher extends Layout {
  constructor(props) {
    super(props);
  }

  renderBodyContainerContent() {
    return (
      <form>
        <div className="input-group">
            <label>
              components
            </label>
            <div>
              <input
                id="task-component-1"
                className="form-control"
                defaultValue="commandBased" />
            </div>
        </div>
        <div className="input-group">
          <label
            htmlFor="task-created-by">
            createdBy
          </label>
          <input
            id="task-created-by"
            className="form-control"
            defaultValue="bmichalski"
            type="text" />
        </div>
        <div className="input-group">
          <label
            htmlFor="task-task-type-id">
            taskTypeId
          </label>
          <input
            id="task-task-type-id"
            className="form-control"
            defaultValue="foobar"
            type="text" />
        </div>
        <div className="input-group">
          <label
            htmlFor="task-task-type-name">
            taskTypeName
          </label>
          <input
            id="task-task-type-name"
            className="form-control"
            defaultValue="bazquz"
            type="text" />
        </div>
        <div
          className="btn-group">
          <button
            id="task-submit"
            type="submit"
            className="btn btn-primary">
            Create
          </button>
        </div>
      </form>
    );
  }
}

export default TaskLauncher