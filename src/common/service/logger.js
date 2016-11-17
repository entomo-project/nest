import winston from 'winston'

export default (environment) => {
  const consoleTransport = new (winston.transports.Console)({
    colorize: true,
    prettyPrint: true,
    timestamp: true,
    showLevel: true,
    align: true,
    stringify: true
  })

  const logger = new winston.Logger({
    transports: [
      consoleTransport
    ]
  })

  if ('test' === environment) {
    //Disable logging on console when in test environment
    logger.level = false
  } else {
    logger.level = 'debug'

    logger.handleExceptions([
      consoleTransport
    ])
  }

  return logger
}
