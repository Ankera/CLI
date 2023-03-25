'use strict'
import createInitCommand from '@zm-template/ac-init'
import createInstallCommand from '@zm-template/ac-install'
import createLintCommand from '@zm-template/ac-lint'
import createCommitCommand from '@zm-template/ac-commit'
import createCli from './createClI.js'
import './exception.js'

export default function () {
  const program = createCli()

  createInitCommand(program)

  createInstallCommand(program)

  createLintCommand(program)

  createCommitCommand(program)

  program.parse(process.argv)
}
