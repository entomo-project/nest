import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import Html from '../Resources/views/Html'

class TaskController {
  register(app) {
    app.get('*', (req, res) => {
      res.send(
        renderToStaticMarkup(
          <Html />
        )
      )
    })
  }
}

export default TaskController