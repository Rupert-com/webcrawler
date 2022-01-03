// https://github.com/log4js-node/log4js-node
import log4js from 'log4js'
log4js.configure({
  ...(process.env.LOGGER === 'file'
    ? {
        appenders: { out: { type: 'file', filename: 'info.log', layout: { type: 'basic' }, flags: 'w' } },
      }
    : { appenders: { out: { type: 'stdout', layout: { type: 'coloured' } } } }),
  categories: { default: { appenders: ['out'], level: 'info' } },
})

log4js.levels.INFO.colour = 'blue'

const logger = log4js.getLogger('out')

export default logger
