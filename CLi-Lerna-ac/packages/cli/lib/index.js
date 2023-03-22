'use strict';
import createCommandInit from '@zm-template/ac-init';
import createCommandInstall from '@zm-template/ac-install';
import createCli from './createClI.js';
import './exception.js';

export default function () {
  const program = createCli();

  createCommandInit(program);

  createCommandInstall(program);

  program.parse(process.argv)
}