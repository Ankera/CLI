#!/usr/bin/env node

'use strict';

// import cli from '../src/cli.mjs'
// // eslint-disable-next-line no-unused-expressions
// cli().parse(process.argv.slice(2));


import a from "@zm-template/lerna-test-a"
import b from "@zm-template/lerna-test-b"

console.log(a())
console.log(b())