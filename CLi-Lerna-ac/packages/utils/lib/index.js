import log from './log.js'
import isDebug from './isDebug.js'
import { makeList, makeInput, makePassword } from './inquirer.js'
import { getLastesVersion } from './npm.js'
import request from './request.js'
import Github from './git/github.js'
import Gitee from './git/gitee.js'
import { getGitPlatform } from './git/gitServer.js'

export function printErrorLog(e, type) {
  if (isDebug()) {
    log.error(type, e)
  } else {
    log.error(type, e.message)
  }
}

export {
  log,
  isDebug,
  makeList,
  makeInput,
  getLastesVersion,
  request,
  Github,
  Gitee,
  getGitPlatform,
}
