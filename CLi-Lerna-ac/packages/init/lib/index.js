'use strict';

import Command from '@zm-template/ac-command';
import { log } from '@zm-template/ac-utils';
import createTemplate from './createTemplate.js';
import downloadTemplate from './downloadTemplate.js';
import installTemplate from './installTemplate.js';

/**
 * examplte
 * ac-cli init
 * ac-cli init aaa --type project --template template-vue3 -d;
 */
class InitCommand extends Command {
  get command() {
    return 'init [name]'
  }

  get description(){
    return '初始化description'
  }

  get options(){
    return [
      ['-f, --force', '是否强制更新', false],
      ['-t, --type <type>', '项目类型(值:project/page)'],
      ['-tp, --template <type>', '模板名称'],
    ]
  }

  async action(name, options){
    log.verbose('子类', name, options);
    // 1、选择项目模块，生成项目信息
    const selectedTemplate = await createTemplate(name, options);

    // 2、下载项目模块至缓存目录
    await downloadTemplate(selectedTemplate);

    // 3、安装项目模块至项目目录
    await installTemplate(selectedTemplate, options);
  }

  // preAction(){
  //   log.verbose('preAction')
  // }

  // postAction(){
  //   log.success('postAction')
  // }
}


function  Init(params) {
  return new InitCommand(params)
}

export default Init;