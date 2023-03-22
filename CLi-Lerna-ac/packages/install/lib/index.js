'use strict';

import Command from '@zm-template/ac-command';
import ora from 'ora';
import chalk from 'chalk';
import { log, Github, Gitee, makeList, getGitPlatform, makeInput } from '@zm-template/ac-utils';

const PREV_PAGE = Symbol.for('PREV_PAGE');
const NEXT_PAGE = Symbol.for('NEXT_PAGE');

class InstallCommand extends Command {

  constructor(program){
    super(program);
    this.page = 1;
    this.perPage = 2;
  }

  get command() {
    return 'install'
  }

  get description(){
    return '初始化工程'
  }

  get options(){
    return []
  }

  async action(){
    await this.generateGitAPI();

    await this.searchGitAPI();
  }

  async generateGitAPI() {
    let platform = await getGitPlatform();
    if(!platform){
      platform = await makeList({
        message: "请选择Git平台",
        choices: [
          {
            name: "Github",
            value: "github"
          },
          {
            name: "Git",
            value: "git"
          }
        ]
      });
    }
    
    log.verbose('Git平台', platform);

    let gitAPI;
    if(platform === 'github') {
      gitAPI = new Github();
    }

    if(platform === 'git') {
      gitAPI = new Gitee();
    }

    this.gitAPI = gitAPI;

    await gitAPI.init(platform);
  }

  async searchGitAPI() {
    // 1、搜索关键词和开发语言 
    this.q = await makeInput({
      message: "请输入搜索关键词",
      validate(value) {
        if(value.length > 0) {
          return true;
        }
        return '请输入搜索关键词';
      }
    });

    this.language = await makeInput({
      message: "请输入开发语言"
    });

    const platform = this.gitAPI.getPlatform();
    log.verbose('搜索参数', this.q, this.language, platform);

    await this.doSearch();
  }

  async doSearch() {
    
    let searchResult;
    let count = 0;
    let list = [];
    let params = {};
    const platform = this.gitAPI.getPlatform();

    // github
    if(platform === 'github'){
       // 2、生成搜索参数
      params = {
        q: this.q + (this.language ? `+language:${this.language}` : ''),
        order: 'desc',
        sort: "stars",
        page: this.page,
        per_page: this.perPage
      };
    }

    const spinner = ora('搜索中...').start();
    // 远程仓库下载的项目
    searchResult = await this.gitAPI.searchRepositories(params);
    spinner.stop();

    count = searchResult.total_count;
    list = searchResult.items.map((item) => ({
      name: `${chalk.red.bold(item.full_name)} || ${chalk.underline.rgb(153, 153, 153)(item.description)}`,
      value: item.full_name
    }));

    // 判断当前页码是否最大页码
    if(this.page * this.perPage < count) {
      list.push({
        name: "下一页",
        value: NEXT_PAGE
      });
    } 

    if(this.page > 1){
      list.unshift({
        name: "上一页",
        value: PREV_PAGE
      });
    }

    const keyword = await makeList({
      message: `请选择要下载的项目: (共${count}条数据):`,
      choices: list
    })

    if(keyword === NEXT_PAGE){
      await this.nextPage();
    } else if(keyword === PREV_PAGE){
      await this.prevPage();
    } else {
      // 下载项目
    }
  }

  async nextPage(){
    this.page++;
    await this.doSearch();
  }

  async prevPage(){
    this.page--;
    await this.doSearch();
  }
}

function Install(program) {
  return new InstallCommand(program);
}

export default Install;
