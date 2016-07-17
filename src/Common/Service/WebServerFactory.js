import express from 'express'
import bodyParser from 'body-parser'
import timeout from 'connect-timeout'

function haltOnTimedout(req, res, next){
  if (!req.timedout) {
    next()
  }
}

function WebServerFactory() {
  const app = express()

  //FIXME not in prod?
  app.use(timeout('5s'))
  app.use(bodyParser.json())
  app.use(haltOnTimedout)

  return app
}

export default WebServerFactory