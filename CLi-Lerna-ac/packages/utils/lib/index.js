import log  from './log.js';
import isDebug from './isDebug.js';
import { makeList } from './inquirer.js';
import { getLastesVersion } from './npm.js';
import request from './request.js';

export function printErrorLog(e, type){
  if(isDebug()) {
    log.error(type, e)
  } else {
    log.error(type, e.message)
  }
}

export  {
  log,
  isDebug,
  makeList,
  getLastesVersion,
  request
}
