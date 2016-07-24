import React from 'react'
import ReactDOMServer from 'react-dom/server'
import Layout from  '../../Common/Resources/views/Layout'

class TaskController {
  register(app) {
    app.get('*', (req, res) => {
      res.send(
        ReactDOMServer.renderToStaticMarkup(
          React.createElement(Layout)
        )
      )
    })
  }
}

export default TaskController;