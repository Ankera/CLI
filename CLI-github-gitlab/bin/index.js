#! /usr/bin/env node

import { program } from 'commander'
import inquirer from 'inquirer'
import path from 'node:path'
import fs from 'node:fs'
import cp from 'node:child_process'
import { dirname } from 'dirname-filename-esm'

const __dirname = dirname(import.meta)

const pkgPath = path.resolve(__dirname, '../package.json')

const pkg = fs.readFileSync(pkgPath)

program.version(pkg.version || '1.0.0')

program.command('git').action(async () => {
  let gitID = await inquirer
    .prompt({
      type: 'list',
      name: 'name',
      message: '请选择仓库类型',
      defaultValue: 1,
      choices: [
        {
          name: 'GITLAB',
          value: 1,
        },
        {
          name: 'GITHUB',
          value: 2,
        },
      ],
    })
    .then((answer) => {
      return answer.name
    })

  console.log('生成gitID', gitID === 1 ? 'GITLAB' : 'GITHUB')

  if (gitID === 1) {
    cp.execSync(`git config --global user.name  "子木";`)
    cp.execSync(`git config --global user.email  "zimu@ywwl.com";`)
  }

  if (gitID === 2) {
    cp.execSync(`git config --global user.name  "ankera";`)
    cp.execSync(`git config --global user.email  "15189120919@163.com";`)
  }

  console.log('============ 切换成功  ============')
  let res = cp.execSync('git config user.name;git config user.email;')
  res = res.toString().split('\n')
  console.log(`git user.name: ${res[0]}`)
  console.log(`git user.email: ${res[1]}`)
})

program.parse(process.argv)
