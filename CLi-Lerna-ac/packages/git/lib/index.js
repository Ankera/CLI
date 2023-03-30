import Command from '@zm-template/ac-command'
import { log, makeInput } from '@zm-template/ac-utils'
import { ESLint } from 'eslint'
import path from 'node:path'
import { execa } from 'execa'

class GitCommand extends Command {
  constructor(program) {
    super(program)
  }

  get command() {
    return 'git <message>'
  }

  get description() {
    return 'git 自动提交 工具'
  }

  get options() {
    return []
  }

  async action(message) {
    log.verbose('commit参数', message)

    await execa('git', ['add', '.'], {
      stdout: 'inherit',
    })

    await execa('git', ['commit', `-am "${message}" -n`], {
      stdout: 'inherit',
    })

    await execa('git', ['push'], {
      stdout: 'inherit',
    })
  }
}

function Git(program) {
  return new GitCommand(program)
}

export default Git
