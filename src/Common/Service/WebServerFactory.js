import express from 'express'
import bodyParser from 'body-parser'
import timeout from 'connect-timeout'

const haltOnTimedout = (req, res, next) => {
  if (!req.timedout) {
    next()
  }
}

const WebServerFactory = () => {
  const app = express()

  //FIXME not in prod?
  app.use(timeout('5s'))
  app.use(bodyParser.json())
  app.use(haltOnTimedout)

  app.set('x-powered-by', false)

  return app
}

export default WebServerFactory