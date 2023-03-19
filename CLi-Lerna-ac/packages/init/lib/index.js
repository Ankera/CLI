'use strict';

import Command from '@zm-template/ac-command';
import { log } from '@zm-template/ac-utils';

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
      ['-v, --vv', 'vvv', false],
    ]
  }

  action(name, options){
    log.verbose('子类', name, options);
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