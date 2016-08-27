import React from 'react'

class TaskLauncher extends React.Component {
  render() {
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
            htmlFor="task-type">
            Type
          </label>
          <input
            id="task-type"
            className="form-control"
            defaultValue="foobar"
            type="text" />
        </div>
        <div className="input-group">
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
    )
  }
}

export default TaskLauncher