import Command from '@zm-template/ac-command'
import {
  log,
  initGitServer,
  initGitType,
  clearCache,
  createRemoteRepo,
} from '@zm-template/ac-utils'
import fse from 'fs-extra'
import fs from 'node:fs'
import path from 'node:path'
import ora from 'ora'
import chalk from 'chalk'

// 缓存目录
const CACHE_DIR = '.ac-cli'
const FILE_GIT_PLGTFORM = '.git_platform'

class CommitCommand extends Command {
  constructor(program) {
    super(program)
    this.gitAPI = null
  }

  get command() {
    return 'commit'
  }

  get description() {
    return '初始化工程 commit'
  }

  get options() {
    return [['-cc --clear-cache', '清除缓存', false]]
  }

  async action(options) {
    log.verbose('commit参数', options)
    if (options.clearCache) {
      await clearCache()
    }
    await this.createRemoteRepo()
  }

  async createRemoteRepo() {
    // 1、实例化Git对象
    this.gitAPI = await initGitServer()

    // 2、仓库选择类型（个人&阻止）
    await initGitType(this.gitAPI)

    // 3、创建远程仓库
    // 获取项目名称
    const dir = process.cwd()
    const pkg = fse.readJsonSync(path.resolve(dir, 'package.json'))
    await createRemoteRepo(this.gitAPI, pkg.name)
  }
}

export default function Commit(program) {
  return new CommitCommand(program)
}
