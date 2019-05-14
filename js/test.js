const fs = require('fs');
const path = require('path');
// let data = fs.readFileSync('ctopic.csv').toString();
// data = data.split('\r\n');
// let tmp = {};
// for(let term of data){
//   let t = term.split(',');
//   tmp[t[1]] = t[0];
// }
// // let str = '';
// // data = fs.readFileSync('C.txt').toString().split('\r\n');
// // for(let term of data){
// //   let t = term.split(' ');
// //   str += tmp[t[0]] + ' ' + tmp[t[1]] + '\r\n';
// // }
// // fs.writeFile('clink.txt', str,function(err){
  
// // });
// console.log(tmp)

// let data = fs.readFileSync('../data/mc.txt').toString();
// let tmp = {};
// data = data.split('\n');
// for(let i = 1; i < data.length - 1; i++){
//   let line = data[i].split(' ');
//   if(tmp[line[2]] === undefined){
//     tmp[line[2]] = [line[0].replace(/"/g, '')];
//   }else{
//     tmp[line[2]].push(line[0].replace(/"/g,''));
//   }
// }
// fs.writeFileSync('../data/mc.json', JSON.stringify(tmp));

// console.log(tmp);

// let data = fs.readFileSync('../data/mc.json').toString();
// data = JSON.parse(data);
// console.log(data['1']);

// let data = fs.readFileSync('../data/clink.txt').toString();
// data = data.split('\n');
// let tmp = {};
// for(let i = 0; i < data.length - 1; i++){
//   let line = data[i].split(' ');
//   if(tmp[line[0]] === undefined){
//     tmp[line[0]] = [line[1]];
//   }else{
//     tmp[line[0]].push(line[1]);
//   }
// }
// fs.writeFileSync('../data/clink.json', JSON.stringify(tmp));
// console.log(data);

// let links = JSON.parse(fs.readFileSync('../data/clink.json').toString());
// let topics = JSON.parse(fs.readFileSync('../data/mc.json').toString());
// let tmp = {};
// let com = topics['3'];
// for(let topic of com){
//   tmp[topic] = links[topic];
// }
// console.log(tmp);
// console.log(path.resolve(__dirname, '../data/mc.json'))
// let topics = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../data/mc.json')).toString());

// 知识簇间的边 
let links = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../data/clink.json')).toString());
let str = fs.readFileSync(path.resolve(__dirname, '../data/mc.txt')).toString().split('\n');
let topics = {}
for(let i = 1; i < str.length - 1; i++){
  let line = str[i].split(' ');
  topics[line[0].split('"')[1]] = line[2];
}
let edges = [];
for(let key in links){
  let num = topics[key];
  for(let topic of links[key]){
    if(topics[topic] !== num){
      edges.push([num, topics[topic]]);
    }
  }
}
let tmp = {};
for(let topic in topics){
  if(tmp[topics[topic]] === undefined){
    tmp[topics[topic]] = [topic];
  }else{
    tmp[topics[topic]].push(topic)
  }
}
var fulllinks = {
  '104793': [ '104808', '104803', '104800' ],
  '104795': [ '104835', '104839', '104840' ],
  '104798': [ '104827' ],
  '104802': [
    '104837', '104806',
    '104798', '104809',
    '104797', '104799',
    '104807', '104804',
    '104805'
  ],
  '104806': [ '104827' ],
  '104811': [ '104793' ],
  '104813': [ '104815', '104830', '104834' ],
  '104814': [ '104817' ],
  '104821': [ '104822' ],
  '104823': [ '104818', '104821' ],
  '104827': [ '104826' ],
  '104829': [ '104831', '104795' ],
  '104830': [ '104829' ],
  '104832': [ '104819', '104810', '104820' ],
  '104836': [ '104835' ],
  '104837': [
    '104841',
    '104836',
    '104794',
    '104823',
    '104813',
    '104814',
    '104843'
  ],
  '104838': [ '104832' ],
  '104841': [
    '104842',
    '104833',
    '104812',
    '104796',
    '104811',
    '104839',
    '104843',
    '104838'
  ],
  '104842': [ '104801' ]
};
let temp = {};
for(let com in tmp){
  temp[com] = {};
  for(let topic of tmp[com]){
    // console.log(fulllinks[topic])
    if(fulllinks[topic] === undefined){
      temp[com][topic] = undefined;
      continue;
    }
    for(let endtopic of fulllinks[topic]){
      if(tmp[com].indexOf(endtopic) !== -1){
        if(temp[com][topic] === undefined){
          temp[com][topic] = [endtopic];
        }else{
          temp[com][topic].push(endtopic);
        }
      }
    }
  }
}
console.log(temp)
// console.log(tmp)
// console.log(links);
// console.log(edges);
// console.log(str.split('\n'));