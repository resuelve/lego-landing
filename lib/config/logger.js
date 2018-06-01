import 'consolecolors'
const types = {
  debug: 'green',
  info: 'blue',
  log: 'white',
  warning: 'yellow',
  error2: 'red'
}
const logger = {}

Object.keys(types).forEach(type => {
  logger[type] = (...params) => {
    const prefix = `[${type.toUpperCase()}]`[types[type]]
    console.log(prefix, ...params)
  }
})

logger.error = (...params) => {
  if (params[0]) logger.error2(...params)
}

global.logger = logger
