'use strict';

class Command {
  constructor(instance){
    if(!instance){
      throw new Error('command instance must not be null');
    }
    this.program = instance;

    const cmd = this.program.command(this.command);
    cmd.description(this.description);

    cmd.hook('preAction', () => {
      this.preAction();
    })

    cmd.hook('postAction', () => {
      this.postAction();
    })

    if(this.options?.length > 0){
      this.options.forEach(option => {
        cmd.option(...option)
      })
    }
    cmd.action((...args) => {
      this.action(...args);
    })
  }

  get command(){
    throw new Error('子类必须实现该方法');
  }

  get description(){
    throw new Error('描述符必须实现');
  }

  get options (){
    return [
      ['-f, --force', '是否强制更新', false]
    ]
  }

  action(){
    throw new Error('action动作必须子类实现');
  }

  preAction(){

  }

  postAction(){

  }
}

export default  Command;