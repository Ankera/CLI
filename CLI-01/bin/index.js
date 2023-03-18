#! /usr/bin/env node

const pkg = require('../package.json');
const lib = require('CLI-01-lib');

const { Command } = require('commander');

const program = new Command();

program
  .name(pkg.name)
  .description('CLI to some JavaScript string utilities')
  .usage('<command> [options]')
  .version(pkg.version)
  .option('-d --debug', '四否开启debug模式', false)
  .option('-e --envName <envName>', '获取环境变量', 'dev')

// program.command('split')
//   .description('Split a string into substrings and display as an array')
//   .argument('<string>', 'string to split')
//   .option('--first', 'display just the first substring')
//   .option('-s, --separator <char>', 'separator character', ',')
//   .action((str, options) => {
//     const limit = options.first ? 1 : undefined;
//     console.log(str.split(options.separator, limit));
//   });

const clone = program.command('clone <source> [des]');

clone
  .option('-f --force', '是否强制clone')
  .action((s, d, e) => {
  console.log('clone', s, d, e)
})

program.action((s, d, e) => {
  console.log('clone', s)
})

program.parse(process.argv);

  
console.log(program.opts());