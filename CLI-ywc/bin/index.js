#! /usr/bin/env node

import { program } from 'commander'
import inquirer from 'inquirer'

program.version('1.0.0')

program.command('api <id>').action(async (apiId) => {
  const projectId = await inquirer
    .prompt([
      {
        type: 'list',
        name: 'name',
        message: '请选择项目类型',
        default: 'PRO_XY_LIVE',
        choices: [
          {
            name: '直播<yw-broadcast>',
            value: 'PRO_XY_LIVE',
          },
          {
            name: '电狼<yw-dianlang>',
            value: 'PRO_DIANLANG',
          },
          {
            name: '商品中心<yw-goods>',
            value: 'PROGOODS',
          },
          {
            name: '商家<yw-supply>',
            value: 'PROSUPPLIER',
          },
          {
            name: '电虎<yw-supply>',
            value: 'PRO_DIANHU',
          },
        ],
      },
    ])
    .then((answer) => {
      return answer.name
    })

  await execa('yw', ['api', apiId, `--projectId=${projectId}`], {
    stdout: 'inherit',
  })
})

program.parse(process.argv)
