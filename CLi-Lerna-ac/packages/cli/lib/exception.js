import { isDebug, log } from '@zm-template/ac-utils'

function printErrorLog(e, type) {
  if (isDebug()) {
    log.error(type, e)
  } else {
    log.error(type, e.message)
  }
}

process.on('unhandledRejection', (e) => {
  printErrorLog(e, 'promise')
})

process.on('uncaughtException', (e) => {
  printErrorLog(e, 'error')
})
