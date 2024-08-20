#! /usr/bin/env node
import { homedir } from 'node:os'
import { program } from 'commander'
import inquirer from 'inquirer'
import { pathExistsSync } from 'path-exists'
import { execa } from 'execa'
import path from 'node:path'
import fs from 'node:fs'
import fse from 'fs-extra'
import { dirname } from 'dirname-filename-esm'

const __dirname = dirname(import.meta)

const pkgPath = path.resolve(__dirname, '../package.json')

const projectPath = path.join(__dirname, './project.json')

const pkg = fse.readJsonSync(pkgPath)

const projecJSON = fse.readJsonSync(projectPath)

const TEMP_HOME = '.ac-cli'

const PROJECT_CACHE_KEY = '.yw_project_cache_key'

program.version(pkg.version || '1.0.0')

program
  .command('api [id]')
  .option('-b, --batch <type>', '批量apiId')
  .option('-o, --overwrite', '是否覆盖projectID', false)
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

    let ywId = getYwToken()

    if (!ywId || opts.overwrite) {
      ywId = await inquirer.prompt([projecJSON]).then((answer) => {
        return answer.name
      })
      const ywPath = createYwPath()
      fs.writeFileSync(ywPath, ywId)
    }

    console.log('生成apiID', newId)

    for (let i = 0; i < newId.length; i++) {
      await execa('yw', ['api', newId[i], `--projectId=${ywId}`], {
        stdout: 'inherit',
      })
    }
  })

program.parse(process.argv)

function createYwPath() {
  return path.resolve(homedir(), TEMP_HOME, PROJECT_CACHE_KEY)
}

function getYwToken() {
  const ywPath = createYwPath()
  if (pathExistsSync(ywPath)) {
    return fse.readFileSync(ywPath).toString()
  }

  return null
}
