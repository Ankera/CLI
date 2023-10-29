#! /usr/bin/env node

import { program } from 'commander'
import inquirer from 'inquirer'
import path from 'node:path'
import fs from 'node:fs'
import cp from 'node:child_process'
import { dirname } from 'dirname-filename-esm'
import chalk from 'chalk';

const __dirname = dirname(import.meta)

const pkgPath = path.resolve(__dirname, '../package.json')

const pkg = fs.readFileSync(pkgPath)

program.version(pkg.version || '1.0.0').description('常用脚手架目录');

program
  .command('git')
  .description('快速切换Github、阿里云-司顺、Gitee的GIT配置')
  .action(async () => {
  let gitID = await inquirer
    .prompt({
      type: 'list',
      name: 'name',
      message: '请选择仓库类型',
      defaultValue: 1,
      choices: [
        {
          name: '阿里云-司顺',
          value: 1,
        },
        {
          name: 'GITHUB',
          value: 2,
        },
        {
          name: 'GITEE',
          value: 3,
        },
      ],
    })
    .then((answer) => {
      return answer.name
    })

  console.log('生成gitID---', gitID === 1 ? 'GITLAB' : 'GITHUB')

  if (gitID === 1) {
    cp.execSync(`git config --global user.name  "余亚勇";`)
    cp.execSync(`git config --global user.email  "15189120919@63.com";`)
  }

  if (gitID === 2) {
    cp.execSync(`git config --global user.name  "ankera";`)
    cp.execSync(`git config --global user.email  "15189120919@163.com";`)
  }

  if (gitID === 3) {
    cp.execSync(`git config --global user.name  "laoyu";`)
    cp.execSync(`git config --global user.email  "15189120919@139.com";`)
  }

  console.log(`${chalk.bold.hex('#f2f2f2')('=============')} ${chalk.bold.hex('#52c41a')('切换成功')} ${chalk.bold.hex('#f2f2f2')('=============')}`)
  let res = cp.execSync('git config user.name;git config user.email;')
  res = res.toString().split('\n')

  console.log(`git user.name: ${chalk.bold.bgRed(res[0])}`)
  console.log(`git user.email: ${chalk.bold.bgRed(res[1])}`)
})

program
  .command('look')
  .description('查看当前GIT的配置信息')
  .action(async () => {
  console.log(`${chalk.bold.hex('#f2f2f2')('=============')} ${chalk.bold.hex('#52c41a')('查看本地GIT配置文件')} ${chalk.bold.hex('#f2f2f2')('=============')}`)
  const res = cp.execSync('git config --list;');
  console.log(`%c${res.toString()}`, 'color: red;')
})

// 撤销本地commit
program
  .command('reset')
  .description('快速撤销Git本地commit的文件')
  .action(async () => {
  cp.execSync(`git reset --soft HEAD^`)
  console.log(`${chalk.bold.hex('#f2f2f2')('=============')} ${chalk.bold.hex('#52c41a')('本地commit撤销成功')} ${chalk.bold.hex('#f2f2f2')('=============')}`)
})

/**
 * 打开指定的工作目录
 */
program
  .command('file')
  .description('快速切换本地工作目录')
  .action(async () => {
  const FILE_HEADER = '/Users/yuyayong/Documents';
  const fileId = await inquirer
    .prompt({
      type: 'list',
      name: 'name',
      message: '请选择需要的工作目录',
      defaultValue: 1,
      choices: [
        {
          name: 'www-soa',
          value: 'www-soa',
        },
        {
          name: 'm-soa',
          value: 'm-soa',
        },
        {
          name: 'share-web',
          value: 'share-web',
        },
        {
          name: 'github',
          value: 'github',
        },
      ],
    })
    .then((answer) => {
      return answer.name
    })

    if (fileId === 'www-soa') {
      console.log(`cd ${FILE_HEADER}/work/share-web/www-soa`)
    }

    if (fileId === 'm-soa') {
      console.log(`cd ${FILE_HEADER}/work/share-web/m-soa`)
    }

    if (fileId === 'share-web') {
      console.log(`cd ${FILE_HEADER}/work/share-web`)
    }

    if (fileId === 'github') {
      console.log(`cd ${FILE_HEADER}/github`)
    }

    console.log(`${chalk.bold.hex('#f2f2f2')('=============')} ${chalk.bold.hex('#52c41a')(`切换成功|进入${fileId}`)} ${chalk.bold.hex('#f2f2f2')('=============')}`)
})

program.parse(process.argv)
