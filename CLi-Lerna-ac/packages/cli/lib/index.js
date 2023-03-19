'use strict';
import createCommandInit from '@zm-template/ac-init';
import createCli from './createClI.js';
import './exception.js';

export default function () {
  const program = createCli();

  createCommandInit(program);

  program.parse(process.argv)
}