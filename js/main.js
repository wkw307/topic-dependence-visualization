// 数据结构 21
// C语言 104802

const parseAPI = require('./parseAPI.js');
const fs = require('fs');
const async = require('async');
let data = fs.readFileSync('../data/C语言.json').toString();
data = JSON.parse(data).data;
let result = parseAPI(data, '104802');
// console.log(result);

let nodes = '';
for(let key in result.topics){
  nodes += key + ' ' + result.topics[key] + '\n';
}
let links = '';
for(let key in result.dependeces){
  for(let end of result.dependeces[key]){
    links += key + ' ' + end + '\n';
  }
}

// let cb = function(err, results){
//   console.log(results);
// }
// fs.writeFile('../data/nodes1.txt', nodes, cb);
// fs.writeFile('../data/links.txt', links, cb);
