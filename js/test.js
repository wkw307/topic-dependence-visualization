const fs = require('fs');

let data = fs.readFileSync('ctopic.csv').toString();
data = data.split('\r\n');
let tmp = {};
for(let term of data){
  let t = term.split(',');
  tmp[t[1]] = t[0];
}
let str = '';
data = fs.readFileSync('C.txt').toString().split('\r\n');
for(let term of data){
  let t = term.split(' ');
  str += tmp[t[0]] + ' ' + tmp[t[1]] + '\r\n';
}
fs.writeFile('clink.txt', str,function(err){
  
});