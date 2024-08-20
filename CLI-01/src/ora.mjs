import ora, { oraPromise } from 'ora';
debugger
const spinner = ora('Loading unicorns').start();
spinner.color = 'red';

spinner.prefixText = 'downloading ...'
setTimeout(() => {
	
	spinner.text = 'Loading rainbows';

  spinner.stop();
}, 1000);

// (async function(){
//   const p = new Promise((resolve, reject) => {
//     setTimeout(() => {
//       resolve(null);
//     }, 3000);
//   })

//   await oraPromise(p, {
//     successText: "success",
//     failureText: "failure",
//     color: "red",
//     prefixText: "downloading ...", 
//     text: "加载中"
//   })
// })()