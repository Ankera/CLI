import { program } from 'commander'
import path from 'node:path'
import fse from 'fs-extra'
import { dirname } from 'dirname-filename-esm'
import semver from 'semver'
import chalk from 'chalk'
import { log } from '@zm-template/ac-utils'

const __dirname = dirname(import.meta)

const pkgPath = path.resolve(__dirname, '../package.json')

const pkg = fse.readJsonSync(pkgPath)

const NODE_VERSION = '14.0.0'

function preAction() {
  checkNodeVersion()
}

function checkNodeVersion() {
  const currentVersion = process.version
  log.verbose('current version: ', currentVersion)
  if (!semver.gte(currentVersion, NODE_VERSION)) {
    throw new Error(chalk.red(`node版本必须大于等于${NODE_VERSION}`))
  }
}

export default function () {
  log.info('version', pkg.version)
  program
    .name(Object.keys(pkg.bin)[0])
    .usage('<command> [options]')
    .version(pkg.version)
    .option('-d, --debug', '是否开启本地调试', false)
    .hook('preAction', preAction)

  program.on('option:debug', () => {
    if (program.opts().debug) {
      log.verbose('debug', 'debug模式启动')
    }
  })

  program.on('command:*', (obj) => {
    log.error('这是一个未知的命令', obj[0])
  })
  return program
}
