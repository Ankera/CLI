import Command from '@zm-template/ac-command';
import { log } from '@zm-template/ac-utils';
import { ESLint } from 'eslint';

class LintCommand extends Command {
  constructor(program){
    super(program);
  }

  get command() {
    return 'lint'
  }

  get description(){
    return '初始化工程'
  }

  get options(){
    return []
  }

  async action(){
    // 1、eslint
    const cwd = process.cwd();
    const eslint = new ESLint({cwd});
    const results = await eslint.lintFiles(["**/*.js"]);
    const formatter = await eslint.loadFormatter('stylish');
    const resultText = formatter.format(results);
    console.log('resultText', resultText);

    // 2、jest/mocha
  }
}


function Lint(program) {
  return new LintCommand(program);
}

export default Lint;