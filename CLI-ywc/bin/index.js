#! /usr/bin/env node

import { program } from 'commander'
import inquirer from 'inquirer'
import { execa } from 'execa'
import pkg from '../package.json'

program.version(pkg.version || '1.0.0')

program
  .command('api [id]')
  .option('-b, --batch <type>', '批量apiId')
  .action(async (apiId, opts) => {
    let newId = []
    if (apiId && !opts.batch) {
      newId = [apiId]
    }
    if (!apiId && opts.batch) {
      newId = opts.batch.split('-')
    }
    if (apiId && opts.batch) {
      newId = [apiId].concat(opts.batch.split('-'))
      newId = [...new Set(newId)]
    }

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
              name: '电虎<yw-dianhu>',
              value: 'PRO_DIANHU',
            },
            {
              name: '营销<yw-marketing>',
              value: 'PRO_MARKETING',
            },
            {
              name: '结算<yw-finance>',
              value: 'PRO_SETTLE',
            },
          ],
        },
      ])
      .then((answer) => {
        return answer.name
      })

    console.log('生成apiID', newId)

    for (let i = 0; i < newId.length; i++) {
      await execa('yw', ['api', newId[i], `--projectId=${projectId}`], {
        stdout: 'inherit',
      })
    }
  })

program.parse(process.argv)
