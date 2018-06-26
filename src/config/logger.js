import 'consolecolors'
const types = {
  debug: 'green',
  info: 'blue',
  log: 'white',
  warning: 'yellow',
  error: 'red'
}
const logger = {}

Object.keys(types).forEach(type => {
  logger[type] = (...params) => {
    const prefix = `[${type.toUpperCase()}]`[types[type]]
    console.log(prefix, ...params)
  }
})

global.logger = logger
