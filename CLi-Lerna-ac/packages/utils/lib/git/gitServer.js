import { homedir } from 'node:os'
import path from 'node:path'
import { pathExistsSync } from 'path-exists'
import fse from 'fs-extra'
import fs from 'node:fs'
import { execa } from 'execa'
import log from '../log.js'
import { makePassword } from '../inquirer.js'

// 缓存目录
const TEMP_HOME = '.ac-cli'
const TEMP_TOKEN = '.git_token'
const TEMP_GIT_PLATFORM = '.git_platform'
const TEMP_OWN = '.git_own'
const TEMP_LOGIN = '.git_login'

class GitServer {
  async init(platform) {
    // 判断token是否录入
    const tokenPath = createTokenPath()
    if (pathExistsSync(tokenPath)) {
      this.token = fse.readFileSync(tokenPath).toString()
    } else {
      this.token = await this.getToken()
      fs.writeFileSync(tokenPath, this.token)
    }

    this.savePlatform(platform)

    log.verbose('token', this.token)
    log.verbose('token path', tokenPath)
  }

  getToken() {
    return makePassword({
      message: '请输入token信息',
    })
  }

  savePlatform(platform) {
    this.platform = platform
    const platformPath = createPlatformPath()
    fs.writeFileSync(platformPath, platform)
  }

  saveOwn(gitOwn) {
    this.own = gitOwn
    const ownPath = createOwnPath()
    fs.writeFileSync(ownPath, gitOwn)
  }

  saveLogin(gitLogin) {
    this.login = gitLogin
    const loginPath = createLoginPath()
    fs.writeFileSync(loginPath, gitLogin)
  }

  getPlatform() {
    return this.platform
  }

  getOwn() {
    return this.own
  }

  getLogin() {
    return this.login
  }

  cloneRepo(fullName, tag) {
    if (tag) {
      return execa('git', ['clone', this.getRepoUrl(fullName), '-b', tag])
    }
    return execa('git', ['clone', this.getRepoUrl(fullName)])
  }

  installDependencies(cwd, fullName) {
    const projectPath = getProjectPath(cwd, fullName)
    if (pathExistsSync(projectPath)) {
      return execa('npm', ['install'], { cwd: projectPath, stdout: 'inherit' })
    }
    return null
  }

  async runRepo(cwd, fullName) {
    const projectPath = getProjectPath(cwd, fullName)
    const pkg = getPackageJson(cwd, fullName)
    /**
     * stdout: 'inherit'
     * 继承当前命令，打印日志
     */
    if (pkg) {
      const { scripts, bin, name } = pkg
      if (bin) {
        return execa('npm', ['install', '-g', name], {
          cwd: projectPath,
          stdout: 'inherit',
        })
      }
      if (scripts && scripts.dev) {
        return execa('npm', ['run', 'dev'], {
          cwd: projectPath,
          stdout: 'inherit',
        })
      } else if (scripts && scripts.start) {
        return execa('npm', ['run', 'start'], {
          cwd: projectPath,
          stdout: 'inherit',
        })
      } else {
        log.warn('未找到启动命令')
      }
    }
  }

  getUser() {
    throw new Error('子类必须实现')
  }

  getOrg() {
    throw new Error('子类必须实现')
  }

  createRepo() {
    throw new Error('子类必须实现')
  }
}

function getPackageJson(cwd, fullName) {
  const projectPath = getProjectPath(cwd, fullName)
  const pkgPath = path.resolve(projectPath, 'package.json')
  if (pathExistsSync(pkgPath)) {
    return fse.readJsonSync(pkgPath, 'utf8')
  }
  return null
}

function getProjectPath(cwd, fullName) {
  const projectName = fullName.split('/')[1]
  const projectPath = path.resolve(cwd, projectName)
  return projectPath
}

function createTokenPath() {
  return path.resolve(homedir(), TEMP_HOME, TEMP_TOKEN)
}

function createPlatformPath() {
  return path.resolve(homedir(), TEMP_HOME, TEMP_GIT_PLATFORM)
}

function createOwnPath() {
  return path.resolve(homedir(), TEMP_HOME, TEMP_OWN)
}

function createLoginPath() {
  return path.resolve(homedir(), TEMP_HOME, TEMP_LOGIN)
}

function getGitPlatform() {
  const platformPath = createPlatformPath()
  if (pathExistsSync(platformPath)) {
    return fse.readFileSync(platformPath).toString()
  }

  return null
}

function getGitOwn() {
  const ownPath = createOwnPath()
  if (pathExistsSync(ownPath)) {
    return fse.readFileSync(ownPath).toString()
  }

  return null
}

function getGitLogin() {
  const loginPath = createLoginPath()
  if (pathExistsSync(loginPath)) {
    return fse.readFileSync(loginPath).toString()
  }

  return null
}

async function clearCache() {
  const temp = path.resolve(homedir(), TEMP_HOME)
  const platform = path.resolve(temp, TEMP_GIT_PLATFORM)
  const token = path.resolve(temp, TEMP_TOKEN)
  const own = path.resolve(temp, TEMP_OWN)
  const login = path.resolve(temp, TEMP_LOGIN)
  await fse.removeSync(platform)
  await fse.removeSync(token)
  await fse.removeSync(own)
  await fse.removeSync(login)
}

export { GitServer, getGitPlatform, clearCache, getGitOwn, getGitLogin }
