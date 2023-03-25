import Github from './github.js'
import Gitee from './gitee.js'
import { getGitPlatform, getGitOwn, getGitLogin } from './gitServer.js'
import { makeList } from '../inquirer.js'
import log from '../log.js'

const CK_KEY_GITHUB = 'github'
const CK_KEY_GITEE = 'gitee'

export async function initGitServer() {
  let platform = await getGitPlatform()
  if (!platform) {
    platform = await makeList({
      message: '请选择Git平台',
      choices: [
        {
          name: 'Github',
          value: CK_KEY_GITHUB,
        },
        {
          name: 'Gitee',
          value: CK_KEY_GITEE,
        },
      ],
    })
  }

  log.verbose('Git平台', platform)

  let gitAPI
  if (platform === CK_KEY_GITHUB) {
    gitAPI = new Github()
  }

  if (platform === CK_KEY_GITEE) {
    gitAPI = new Gitee()
  }

  await gitAPI.init(platform)

  return gitAPI
}

export async function initGitType(gitAPI) {
  // 让用户选择仓库类型
  let gitOwn = getGitOwn()
  let gitLogin = getGitLogin()
  if (!gitLogin && !gitOwn) {
    const user = await gitAPI.getUser()
    const org = await gitAPI.getOrg()

    log.verbose('user', user)
    log.verbose('org', org)

    if (!gitOwn) {
      if (!gitOwn) {
        gitOwn = await makeList({
          message: '请选择仓库类型',
          choices: [
            {
              name: 'user',
              value: 'user',
            },
            {
              name: 'Organization',
              value: 'org',
            },
          ],
        })
      }

      log.verbose('gitOwn', gitOwn)
      if (gitOwn === 'user') {
        gitLogin = user?.login
      }

      if (gitOwn === 'org') {
        const orgList = org.map((item) => ({
          name: item.name || item.login,
          value: item.login,
        }))

        gitLogin = await makeList({
          message: '请选择组织名称',
          choices: orgList,
        })
      }
      log.verbose('gitLogin', gitLogin)
    }
  }

  gitAPI.saveOwn(gitOwn)
  gitAPI.saveLogin(gitLogin)

  if (!gitLogin || !gitOwn) {
    throw new Error(
      '未获取到用户Git登录信息，请添加 "ac-cli commit --clear-cache"，及时清除缓存'
    )
  }

  return gitLogin
}

export async function createRemoteRepo(gitAPI, name) {
  const ret = await gitAPI.createRepo(name)
  console.log('ret', ret)
}
