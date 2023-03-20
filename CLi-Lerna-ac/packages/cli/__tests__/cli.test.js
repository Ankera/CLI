
// import { execa } from 'execa';
// import path from 'node:path';

// const CLI = path.join(__dirname, '../bin/cli.js');
// const bin = () => (...args) => execa(CLI, args);

// test('run command', async () => {
//   // stderr stdout
//   const {  stderr } = await bin()('iiii');
//   expect(stderr).toContain('iiii')
// });

// test('--help not null', async () => {
//   let error = null;
//   try {
//     await bin()('--help');
//   } catch (err) {
//     error = err;
//   }
//   expect(error).toBeNull();
// })

// test('show corrent version', async () => {
//   const { stdout } = await bin()('-V');
//   expect(stdout).toContain(require('../package.json').version)
// })

// test('open debug', async () => {
//   let error = null;
//   try {
//     await bin()('--debug');
//   } catch (err) {
//     error = err;
//   }
//   expect(error.message).toContain('debug模式启动')
// })