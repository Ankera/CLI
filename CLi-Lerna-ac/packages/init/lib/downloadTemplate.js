import path from 'node:path'
import { pathExistsSync } from 'path-exists'
import fse from 'fs-extra'
import ora from 'ora'
import { log, printErrorLog } from '@zm-template/ac-utils'
import { execa } from 'execa'

function getCachePath(targetPath) {
  return path.resolve(targetPath, 'node_modules')
}

function makeCacheDir(targetPath) {
  const cache = getCachePath(targetPath)
  if (!pathExistsSync(cache)) {
    fse.mkdirpSync(cache)
  }
}

async function downloadAddTemplate(targetPath, template) {
  const { version, npmName } = template
  const installCommand = 'npm'
  const installArgs = ['install', `${npmName}@${version}`]
  const cwd = targetPath
  log.verbose('installArgs', installArgs)
  log.verbose('cwd', cwd)
  await execa(installCommand, installArgs, { cwd })
}

export default async function downloadTemplate(selectedTemplate) {
  const { type, name, template, targetPath } = selectedTemplate

  makeCacheDir(targetPath)
  const spinner = ora('正在下载模板...').start()

  try {
    await downloadAddTemplate(targetPath, template)
    log.success('模板下载成功')
    spinner.stop()
  } catch (error) {
    log.error('文件下载错误', error.message)
    printErrorLog(error)
    spinner.stop()
  }
}
