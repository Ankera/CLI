'use strict'

import Command from '@zm-template/ac-command'
import ora from 'ora'
import chalk from 'chalk'
import {
  log,
  makeList,
  initGitServer,
  makeInput,
  printErrorLog,
} from '@zm-template/ac-utils'

const PREV_PAGE = Symbol.for('PREV_PAGE')
const NEXT_PAGE = Symbol.for('NEXT_PAGE')

const SEARCH_MODE_REPO = 'SEARCH_MODE_REPO'
const SEARCH_MODE_CODE = 'SEARCH_MODE_CODE'

const CK_KEY_GITHUB = 'github'
const CK_KEY_GITEE = 'gitee'

class InstallCommand extends Command {
  constructor(program) {
    super(program)
    // 源码 & 仓库翻页
    this.page = 1
    this.perPage = 20

    // tag 翻页
    this.tagPage = 1
    this.tagPerPage = 20
  }

  get command() {
    return 'install'
  }

  get description() {
    return '初始化工程'
  }

  get options() {
    return []
  }

  async action() {
    await this.generateGitAPI()

    await this.searchGitAPI()

    await this.selectTags()

    log.verbose('full_name', this.keyword)
    log.verbose('selectedTag', this.selectedTag)

    await this.downloadRepo()

    await this.installDependencies()

    await this.runRepo()
  }

  async downloadRepo() {
    const spinner = ora({
      text: chalk.red.bold(
        `正在下载: ${this.keyword}:${this.selectedTag}中...`
      ),
      spinner: 'material',
    }).start()

    try {
      await this.gitAPI.cloneRepo(this.keyword, this.selectedTag)
      spinner.stop()
      log.success(
        `\n${chalk.red.bold.underline(this.keyword)}:${this.selectedTag}`,
        '下载成功'
      )
    } catch (error) {
      printErrorLog(error)
      spinner.stop()
    }
  }

  async installDependencies() {
    const spinner = ora({
      text: chalk.red.bold(
        `正在安装依赖: ${this.keyword}:${this.selectedTag}中...`
      ),
      spinner: 'material',
    }).start()

    try {
      const ret = await this.gitAPI.installDependencies(
        process.cwd(),
        this.keyword
      )
      spinner.stop()
      if (ret) {
        log.success(
          `\n${chalk.red.bold.underline(this.keyword)}:${this.selectedTag}`,
          '安装成功'
        )
      } else {
        log.error('安装依赖失败...')
      }
    } catch (error) {
      printErrorLog(error)
      spinner.stop()
    }
  }

  async runRepo() {
    await this.gitAPI.runRepo(process.cwd(), this.keyword)
  }

  async generateGitAPI() {
    this.gitAPI = await initGitServer()
  }

  async searchGitAPI() {
    const platform = this.gitAPI.getPlatform()
    if (platform === CK_KEY_GITHUB) {
      this.mode = await makeList({
        message: '请选择搜索模式',
        choices: [
          {
            name: '仓库',
            value: SEARCH_MODE_REPO,
          },
          {
            name: '源码',
            value: SEARCH_MODE_CODE,
          },
        ],
      })
    } else {
      this.mode = SEARCH_MODE_REPO
    }

    // 1、搜索关键词和开发语言
    this.q = await makeInput({
      message: '请输入搜索关键词',
      validate(value) {
        if (value.length > 0) {
          return true
        }
        return '请输入搜索关键词'
      },
    })

    this.language = await makeInput({
      message: '请输入开发语言',
    })

    await this.doSearch()
  }

  async doSearch() {
    let searchResult
    let count = 0
    let list = []
    let params = {}
    const platform = this.gitAPI.getPlatform()

    // github
    if (platform === CK_KEY_GITHUB) {
      // 2、生成搜索参数
      params = {
        q: this.q + (this.language ? `+language:${this.language}` : ''),
        order: 'desc',
        // sort: "stars",
        page: this.page,
        per_page: this.perPage,
      }
    }

    if (platform === CK_KEY_GITEE) {
      params = {
        q: this.q,
        order: 'desc',
        // sort: "stars_count",
        page: this.page,
        per_page: this.perPage,
      }
      if (this.language) {
        params.language = this.language
      }
    }

    log.verbose('搜索参数', params)

    const spinner = ora({
      text: chalk.red.bold('搜索中...'),
      spinner: 'material',
    }).start()

    // 远程仓库下载的项目
    if (platform === CK_KEY_GITHUB) {
      if (this.mode === SEARCH_MODE_REPO) {
        // 搜索仓库
        searchResult = await this.gitAPI.searchRepositories(params)
        list = searchResult.items.map((item) => ({
          name: `${chalk.red.bold(item.full_name)} || ${
            item.description
              ? chalk.underline.rgb(153, 153, 153)(item.description)
              : '--'
          }`,
          value: item.full_name,
        }))
      } else {
        // 搜索源码
        searchResult = await this.gitAPI.searchCode(params)
        list = searchResult.items.map((item) => ({
          name: `${chalk.red.bold(item.repository.full_name)} || ${
            item.repository.description
              ? chalk.underline.rgb(153, 153, 153)(item.repository.description)
              : '--'
          }`,
          value: item.repository.full_name,
        }))
      }

      count = (searchResult || {}).total_count || 9999
    }

    if (platform === CK_KEY_GITEE) {
      if (this.mode === SEARCH_MODE_REPO) {
        // 搜索仓库
        searchResult = await this.gitAPI.searchRepositories(params)

        list = (searchResult || []).map((item) => ({
          name: `${chalk.red.bold(item.full_name)} || ${
            item.description
              ? chalk.underline.rgb(153, 153, 153)(item.description)
              : '--'
          }`,
          value: item.full_name,
        }))

        count = 9999
      }
    }

    spinner.stop()

    if (count > 0) {
      // 判断当前页码是否最大页码
      if (platform === CK_KEY_GITHUB && this.page * this.perPage < count) {
        list.push({
          name: '下一页',
          value: NEXT_PAGE,
        })
      }

      if (platform === CK_KEY_GITEE && list.length > 0) {
        list.push({
          name: '下一页',
          value: NEXT_PAGE,
        })
      }

      if (this.page > 1) {
        list.unshift({
          name: '上一页',
          value: PREV_PAGE,
        })
      }

      const keyword = await makeList({
        message:
          platform === CK_KEY_GITHUB
            ? `请选择要下载的项目: (共${chalk.red.bold(count)}条数据):`
            : '请选择要下载的项目',
        choices: list,
      })

      if (keyword === NEXT_PAGE) {
        await this.nextPage()
      } else if (keyword === PREV_PAGE) {
        await this.prevPage()
      } else {
        // 下载项目
        this.keyword = keyword
      }
    }
  }

  async nextPage() {
    this.page++
    await this.doSearch()
  }

  async prevPage() {
    this.page--
    await this.doSearch()
  }

  async selectTags() {
    const tagList = await this.doSelectTags()
  }

  async doSelectTags() {
    const platform = this.gitAPI.getPlatform()
    const params =
      platform === CK_KEY_GITHUB
        ? {
            page: this.tagPage,
            per_page: this.tagPerPage,
          }
        : {}
    let tagListChoices = []

    const spinner = ora({
      text: chalk.red.bold('搜索中...'),
      spinner: 'material',
    }).start()
    const tagList = await this.gitAPI.getTags(this.keyword, params)
    spinner.stop()

    tagListChoices = tagList.map((item) => ({
      name: item.name,
      value: item.name,
    }))

    if (platform === CK_KEY_GITHUB) {
      if (this.tagPage > 1) {
        tagListChoices.unshift({
          name: '上一页',
          value: PREV_PAGE,
        })
      }

      if (tagListChoices.length > 0) {
        tagListChoices.push({
          name: '下一页',
          value: NEXT_PAGE,
        })
      }
    }

    const selectedTag = await makeList({
      message: '请选择相应的tags',
      choices: tagListChoices,
    })

    if (selectedTag === NEXT_PAGE) {
      await this.nextTagPage()
    } else if (selectedTag === PREV_PAGE) {
      await this.prevTagPage()
    } else {
      // 下载项目
      this.selectedTag = selectedTag
    }
  }

  async nextTagPage() {
    this.tagPage++
    await this.doSelectTags()
  }

  async prevTagPage() {
    this.tagPage--
    await this.doSelectTags()
  }
}

function Install(program) {
  return new InstallCommand(program)
}

export default Install
