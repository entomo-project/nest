import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import Html from '../Resources/views/Html'

class TaskController {
  constructor(nestConfig) {
    this._strNestConfig = 'window.nestConfig = ' + JSON.stringify(nestConfig)
  }

  register(app) {
    const strNestConfig = this._strNestConfig
    
    app.get('*', (req, res) => {
      res.send(
        renderToStaticMarkup(
          <Html strNestConfig={strNestConfig} />
        )
      )
    })
  }
}

export default TaskController