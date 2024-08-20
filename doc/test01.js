// var a = '\x1B[30;47m\x1B[3;4m\x1b[31;3;4m'
// console.log(a, 'your name:');

// var b = '\x1B[2B%s';
// console.log(b, 'your name2')

// =================================================================

class Test01 {
  #name = 'test'

  getName(){
    return this.#name;
  }

  #setName(){
    this.#name =  'Tom'
  }
}

const t  = new Test01();
console.log(t.getName())

console.log('\u001B[?25l')

const readline = require('readline');

readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

// console.log('\u001B[?25h')


