import { isDebug, log } from '@zm-template/ac-utils';

function pringErrorLog(e, type){
  if(isDebug()) {
    log.error(type, e)
  } else {
    log.error(type, e.message)
  }
}

process.on('unhandledRejection', (e) => {
  pringErrorLog(e, 'promise');
})

process.on('uncaughtException', (e) => {
  pringErrorLog(e, 'error');
})