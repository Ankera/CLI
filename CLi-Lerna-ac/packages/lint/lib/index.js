import Command from '@zm-template/ac-command'
import { log, printErrorLog } from '@zm-template/ac-utils'
import { ESLint } from 'eslint'
import path from 'node:path'
import { execa } from 'execa'
import ora from 'ora'
import chalk from 'chalk'
import jest from 'jest'
import Mocha from 'mocha'
import vueConfig from './eslint/vue.config.js'

class LintCommand extends Command {
  constructor(program) {
    super(program)
  }

  get command() {
    return 'lint'
  }

  get description() {
    return '初始化工程'
  }

  get options() {
    return []
  }

  extractEslint(resultText, type) {
    const problems = /[0-9]+ problems/
    const warnings = /([0-9])+ warnings/
    const errors = /([0-9])+ errors/
    switch (type) {
      case 'problems':
        return resultText.match(problems)[0].match(/[0-9]+/)[0]
      case 'warnings':
        return resultText.match(warnings)[0].match(/[0-9]+/)[0]
      case 'errors':
        return resultText.match(errors)[0].match(/[0-9]+/)[0]
      default:
        return null
    }
  }

  parseEslintResult(resultText) {
    const problems = this.extractEslint(resultText, 'problems')
    const warnings = this.extractEslint(resultText, 'warnings')
    const errors = this.extractEslint(resultText, 'errors')
    return {
      problems,
      warnings,
      errors,
    }
  }

  async action() {
    // const spinner = ora({
    //   text: chalk.red.bold('依赖安装中...'),
    //   spinner: 'material',
    // }).start()

    // try {
    //   await execa('npm', ['install', '-D', 'eslint-config-airbnb-base'], {
    //     stdout: 'inherit',
    //   })
    //   await execa('npm', ['install', '-D', 'eslint-plugin-vue'], {
    //     stdout: 'inherit',
    //   })
    // } catch (error) {
    //   printErrorLog(error)
    // } finally {
    //   spinner.stop()
    // }

    // 1、eslint
    const cwd = process.cwd()
    const eslint = new ESLint({
      cwd,
      // baseConfig: vueConfig

      // 直接覆盖
      overrideConfig: vueConfig,
    })

    log.info('eslint正在进行检查')
    const results = await eslint.lintFiles(['./src/**/*.js', './src/**/*.vue'])

    const formatter = await eslint.loadFormatter('stylish')
    const resultText = formatter.format(results)
    const eslintResult = this.parseEslintResult(resultText)
    log.verbose('ESLint', eslintResult)
    log.success(
      'ESLint检查',
      `检查完成:  警告: ${eslintResult.warnings}个;   错误: ${eslintResult.errors}个`
    )

    // 2、jest
    // log.info('自动自行jest测试')
    // await jest.run('test')
    // log.success('jest测试执行完毕')

    // 3、 mocha
    log.info('自动自行mocha测试')
    const mochaInstance = new Mocha()
    mochaInstance.addFile(path.resolve(cwd, '__tests__/mocha_test.js'))
    mochaInstance.run()
    log.success('mocha测试执行完毕')
  }
}

function Lint(program) {
  return new LintCommand(program)
}

export default Lint
