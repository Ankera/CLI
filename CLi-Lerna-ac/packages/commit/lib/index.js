import Command from '@zm-template/ac-command'
import {
  log,
  makeInput,
  makeList,
  initGitServer,
  initGitType,
  clearCache,
  createRemoteRepo,
} from '@zm-template/ac-utils'
import fse from 'fs-extra'
import semver from 'semver'
import fs from 'node:fs'
import path from 'node:path'
import ora from 'ora'
import chalk from 'chalk'
import SimpleGit from 'simple-git'

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
    return [
      ['-cc --clear-cache', '清除缓存', false],
      ['-p --publish', '发布', false],
    ]
  }

  async action(options) {
    log.verbose('commit参数', options)
    if (options.clearCache) {
      await clearCache()
    }
    // 一、创建远程仓库
    await this.createRemoteRepo()

    // 二、本地初始化
    await this.initLocal()

    // 三、代码自动化提交
    await this.commit()

    // 四、代码发布
    if (options.publish) {
      await this.publish()
    }
  }

  /**
   * 四、代码发布
   * 创建tag并且推送远程tag
   * 本地切换到master
   * 将开发分支代码合并到master
   */
  async publish() {
    await this.checkTag()

    await this.checkoutBranch('master')

    // 把代码和master分支合并
    await this.mergeBranchToMaster()

    await this.pushRemoteRepo('master')

    // 删除本地分支和远程分支
    await this.deleteLocalBranch()
    await this.deleteRemoteBranch()
  }

  async deleteLocalBranch() {
    log.info('开始删除本地分支', this.branch)
    await this.git.deleteLocalBranch(this.branch)
    log.success('本地分支删除成功', this.branch)
  }

  async deleteRemoteBranch() {
    log.info('开始删除远程分支', this.branch)
    await this.git.push(['origin', '--delete', this.branch])
    log.success('远程分支删除成功', this.branch)
  }

  async mergeBranchToMaster() {
    log.info('开始合并代码', `[${this.branch}] -> [master]`)
    await this.git.mergeFromTo(this.branch, 'master')
    log.success('代码合并成功', `[${this.branch}] -> [master]`)
  }

  async mergeFromTo() {}

  async checkTag() {
    log.info('获取远程tag列表')
    const tag = `release/${this.version}`
    const tagList = await this.getRemoteBranchList('release')
    if (tagList.includes(this.version)) {
      log.info('远程tag已存在', tag)
      await this.git.push(['origin', `:refs/tags/${tag}`])
      log.success('远程tag已删除')
    }

    const localTagList = await this.git.tags()
    if (localTagList.all.includes(this.version)) {
      log.info('本地tag已存在', tag)
      await this.git.push(['-d', tag])
      log.success('本地tag已删除', tag)
    }

    // 本地添加tag
    await this.git.addTag(tag)
    log.success('本地tag创建成功', tag)
    // 把本地tag推送到远程
    await this.git.pushTags('origin')
    log.success('远程tag推送成功', tag)
  }

  // 阶段二、创建远程仓库
  async createRemoteRepo() {
    // 1、实例化Git对象
    this.gitAPI = await initGitServer()

    // 2、仓库选择类型（个人&阻止）
    await initGitType(this.gitAPI)

    // 3、创建远程仓库
    // 获取项目名称
    const dir = process.cwd()
    const pkg = fse.readJsonSync(path.resolve(dir, 'package.json'))
    this.name = pkg.name
    this.version = pkg.version || '1.0.0'
    await createRemoteRepo(this.gitAPI, this.name)

    // 4、生产 gitignore
    const gitIgnorePath = path.resolve(dir, '.gitignore')
    if (!fs.existsSync(gitIgnorePath)) {
      log.info('.gitignore不存在，则创建')
      fs.writeFileSync(gitIgnorePath, 'node_modules\n.vscode\n/dist')
    }
  }

  // 阶段三、代码自动化提交
  async commit() {
    await this.getCorrectVersion()

    // 查看代码缓存区是否有代码
    await this.checkStash()

    // 检查代码是否有冲突
    await this.checkConflicted()

    // 代码提交
    await this.checkNotCommited()

    // 切换到本地新的开发分支
    await this.checkoutBranch(this.branch)

    // 合并远程master代码到当前分支
    await this.pullRemoteMasterAndBranch()

    // 把本地代码推送到远程
    await this.pushRemoteRepo(this.branch)
  }

  /**
   * (git stash )把代码放到缓存区，(git status) 就看不到任何信息
   * git stash pop 从缓存区中撤销
   * git stash list 查看缓存区中的代码
   */
  async checkStash() {
    log.info('检查 stash 记录')
    const stashList = await this.git.stashList()
    if (stashList.all.length > 0) {
      await this.git.stash(['pop'])
      log.success('stash pop 成功')
    }
  }

  /**
   * 代码冲突检查
   */
  async checkConflicted() {
    log.info('代码冲突检查')
    const status = await this.git.status()
    if (status.conflicted.length > 0) {
      throw new Error('代码有冲突，请手动检查更新')
    }
    log.success('代码冲突检查通过')
  }

  async checkoutBranch(branchName) {
    const localBrandList = await this.git.branchLocal(branchName)
    if (localBrandList.all.indexOf(branchName) >= 0) {
      await this.git.checkout(branchName)
    } else {
      await this.git.checkoutLocalBranch(branchName)
    }
    log.success(`本地分支切换到${branchName}`)
  }

  async pullRemoteMasterAndBranch() {
    log.info(`合并[master]分支 -> ${this.branch}`)
    await this.pullRemoteRepo('master')
    log.success(`合并[master]分支成功`)

    // 看远程分支是否和本地当前分支一样
    log.info('检查远程分支')
    const remoteBranchList = await this.getRemoteBranchList()
    if (remoteBranchList.indexOf(this.version) >= 0) {
      log.info(`合并远程分支[${this.branch}] ->  本地分支[${this.branch}]`)
      await this.pullRemoteRepo(this.branch)
      // 代码有冲突终止
      await this.checkConflicted()
      log.success(`远程分支[${this.branch}]合并成功`)
    } else {
      log.success('不存在远程分支')
    }
  }

  async pullRemoteRepo(branch, options = {}) {
    log.info(`同步远程[${branch}]分支代码`)
    await this.git.pull('origin', branch, options).catch((err) => {
      log.error(`git pull origin ${branch}`, err.message)
      if (err.message.indexOf(`couldn't find remote ref ${branch}`) >= 0) {
        log.warn(`获取远程${branch}分支失败`)
      }
      process.exit(0)
    })
  }

  /**
   * 测试生产新的tag: git tag 0.0.1 -m 0.0.1
   * 模拟开发的tag:  git tag -a dev/0.0.1 -m dev/0.0.1
   *
   * 模拟线上的tag:  git tag -a release/0.0.1 -m release/0.0.1
   *               git tag -a release/0.0.2 -m release/0.0.2
   *
   * 把本地tag推送远程: git push --tag
   * 查看tag: git ls-remote --refs
   */
  async getCorrectVersion() {
    log.info('获取代码分支')
    const remoteBrandList = await this.getRemoteBranchList('release')
    let releaseVersion = null
    if (remoteBrandList && remoteBrandList.length > 0) {
      releaseVersion = remoteBrandList[0]
    }
    const devVersion = this.version
    if (!releaseVersion) {
      this.branch = `dev/${devVersion}`
    } else if (semver.gt(devVersion, releaseVersion)) {
      // 本地当前版本号大于线上版本号
      this.branch = `dev/${devVersion}`
      log.info(
        '本地当前版本号大于线上版本号',
        `${devVersion} > ${releaseVersion}`
      )
    } else {
      // 本地当前版本号小于线上版本号
      log.info(
        '本地当前版本号小于线上版本号',
        `${devVersion} <= ${releaseVersion}`
      )
      /**
       * 升级版本号
       * 1.0.0
       * major.minor.patch
       * major = x
       * minor = y
       * patch = z
       */

      const incType = await makeList({
        message: '自动升级版本号，请选择升级版本类型',
        defaultValue: 'patch',
        choices: [
          {
            name: `小版本 (${releaseVersion} -> ${semver.inc(
              releaseVersion,
              'patch'
            )})`,
            value: 'patch',
          },
          {
            name: `中版本 (${releaseVersion} -> ${semver.inc(
              releaseVersion,
              'minor'
            )})`,
            value: 'minor',
          },
          {
            name: `大版本 (${releaseVersion} -> ${semver.inc(
              releaseVersion,
              'major'
            )})`,
            value: 'major',
          },
        ],
      })

      const incVersion = semver.inc(releaseVersion, incType)
      this.branch = `dev/${incVersion}`
      this.version = incVersion
      this.syncVersionToPackageJson()
    }
    log.success(`代码分支获取成功${this.branch}`)
  }

  // 把升级后的版本号同步到 package.json
  syncVersionToPackageJson() {
    const dir = process.cwd()
    const pkgPath = path.resolve(dir, 'package.json')
    const pkg = fse.readJsonSync(pkgPath)
    if (pkg && pkg.version !== this.version) {
      pkg.version = this.version
      // spaces 多少个空格
      fse.writeJsonSync(pkgPath, pkg, { spaces: 2 })
    }
  }

  async getRemoteBranchList(type) {
    const remoteList = await this.git.listRemote(['--refs'])
    let reg
    if (type === 'release') {
      // 线上
      reg = /.+?refs\/tags\/release\/(\d+\.\d+.\d+)/g
    } else {
      // 开发环境
      reg = /.+?refs\/tags\/dev\/(\d+\.\d+.\d+)/g
    }
    return remoteList
      .split('\n')
      .map((remote) => {
        const match = reg.exec(remote)
        reg.lastIndex = 0
        if (match && semver.valid(match[1])) {
          return match[1]
        }
      })
      .filter((_) => _)
      .sort((b, a) => {
        if (semver.lte(a, b)) {
          if (a === b) {
            return 0
          }
          return -1
        }
        return 1
      })
  }

  async checkNotCommited() {
    // 获取未提交的代码
    const status = await this.git.status()
    if (
      status.not_added.length > 0 ||
      status.created.length > 0 ||
      status.deleted.length > 0 ||
      status.modified.length > 0 ||
      status.renamed.length > 0
    ) {
      await this.git.add(status.not_added)
      await this.git.add(status.created)
      await this.git.add(status.deleted)
      await this.git.add(status.modified)
      await this.git.add(status.renamed)
      let message
      while (!message) {
        message = await makeInput({
          message: '请输入commit信息:',
        })
      }

      await this.git.commit(message)
      log.success('本地commit成功')
    }
  }

  // 阶段二，本地初始化
  async initLocal() {
    // 1、获取远程git地址
    const remoteUrl = this.gitAPI.getRepoUrl(
      `${this.gitAPI.login}/${this.name}`
    )

    // 2、初始化git对象
    this.git = SimpleGit(process.cwd())

    // 判断当前项目是否进行了Git初始化
    const gitDir = path.resolve(process.cwd(), '.git')
    if (!fs.existsSync(gitDir)) {
      // git 初始化
      await this.git.init()
      log.success('完成.git初始化')
    }

    // 3、获取所有的remotes
    // 删除远程仓库： git remote remove origin
    const remotes = await this.git.getRemotes()
    if (!remotes.find((remote) => remote.name === 'origin')) {
      await this.git.addRemote('origin', remoteUrl)
      log.success('添加git remote', remoteUrl)

      // 检查未提交的代码
      await this.checkNotCommited()

      // 检查是否存在远程master分支
      const tags = await this.git.listRemote(['--refs'])
      log.verbose('listRemote', tags)
      // 没有远程master时，获取远程分支
      if (tags.indexOf('refs/heads/master') >= 0) {
        // 拉取远程代码分支, 实现代码同步
        this.pullRemoteRepo('master', { '--allow-unrelated-histories': null })
      } else {
        // 推送代码到远程master分支
        await this.pushRemoteRepo('master')
      }
    }
  }

  async pushRemoteRepo(branchName) {
    log.verbose(`推送代码到远程${branchName}分支`)
    await this.git.push('origin', branchName)
    log.success(`git push origin ${branchName} 推送成功`)
  }
}

export default function Commit(program) {
  return new CommitCommand(program)
}
