const inquirer = require('inquirer');

inquirer.prompt([
  // {
  //   type: 'input',
  //   name: "name",
  //   message: 'your name'
  // },
  // {
  //   type: 'confirm',
  //   name: "choice",
  //   message: '选择'
  // },
  {
    type: 'checkbox',
    name: "type",
    default: 0,
    message: '请选择',
    choices: [
      {
        value: 1, name: '桃子'
      },
      {
        value: 2, name: '香蕉',
      },
      {
        value: 3, name: '苹果'
      }
    ]
  }
]).then((data) => {
  console.log(data);
})