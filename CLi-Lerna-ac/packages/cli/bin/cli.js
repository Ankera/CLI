#! /usr/bin/env node

import importLocal from 'import-local'
import { log } from '@zm-template/ac-utils'
import { filename } from 'dirname-filename-esm'
import entry from '../lib/index.js'
import { fileURLToPath } from 'node:url'

// const __filename = fileURLToPath(import.meta.url);
const __filename = filename(import.meta)

if (importLocal(__filename)) {
  log.info('cli', '使用本地 CLI 版本')
} else {
  entry(process.argv.slice(2))
}
