// // topics顺序决定布局
// var topics = [ '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10' ];
// // 对象存储的有向图，key是起点，value是终点数组
// var links = { '0': undefined,
// '1': [ '10' ],
// '2': undefined,
// '3':
//  [ '6',
//    '1',
//    '8',
//    '0',
//    '2',
//    '7',
//    '4',
//    '5' ],
// '4': undefined,
// '5': undefined,
// '6': [ '10' ],
// '7': undefined,
// '8': undefined,
// '9': undefined,
// '10': [ '9' ] };

function detectLeafNode(links, undirectedDependences){
  let leaves = {};
  for(let key in links){
    if(links[key] === undefined){
      if(undirectedDependences[key].length === 1){
        leaves[key] = undirectedDependences[key][0];
      }
    }
  }
  return leaves;
}

/**
 * 将对象存储的有向图转换为二维数组存储的有向图
 * @param {*} links 
 */
function convertObjGraphToArray(links){
  let dependences = [];
  for(let key in links){
    if(links[key] !== undefined){
      for(let value of links[key]){
        let tmp = [key, value];
        dependences.push(tmp);
      }
    }
  }
  return dependences;
}

/**
 * 计算有向图中每一条边与其他边的交点
 * @param {*} topics 
 * @param {*} dependences 
 * @param {*} undirectedDependences 
 */
function caculateEdgeCrossing(topics, dependences, undirectedDependences){
  let topicArr = topics.slice(0);
  let result = {};
  for(let i = 0; i < dependences.length; i++){
    let topic1 = dependences[i][0];
    let topic2 = dependences[i][1];
    result[topic1 + ' ' + topic2] = 0;
    let topic1index = topicArr.indexOf(topic1);
    let topic2index = topicArr.indexOf(topic2);
    let arr1 = topic1index > topic2index ? topicArr.slice(topic2index + 1, topic1index) : topicArr.slice(topic1index + 1, topic2index);
    let arr2 = topic1index > topic2index ? topicArr.slice(topic2index, topic1index + 1) : topicArr.slice(topic1index, topic2index + 1);
    for(let point1 of arr1){
      for(let point2 of undirectedDependences[point1]){
        if(arr2.indexOf(point2) === -1){
          result[topic1 + ' ' + topic2]++;
        }
      }
    }
  }
  return result;
}

// todo
function swapNodes(topics, selectedEdge, undirectedDependences){
  selectedEdge = selectedEdge.split(' ');
  if(undirectedDependences[selectedEdge[0]].length > undirectedDependences[selectedEdge[1]].length){
    topicArr.splice(topicArr.indexOf(selectedEdge[1]), 1);
    topicArr.splice(topicArr.indexOf(selectedEdge[0]), 1, selectedEdge[1]);
  }else{
    topicArr.splice(topicArr.indexOf(selectedEdge[0]), 1);
    topicArr.splice(topicArr.indexOf(selectedEdge[1]), 1, selectedEdge[0]);
  }

}

function detectEdgeCrossing(topics, links){
  let dependences = convertObjGraphToArray(links);
  let undirectedDependences = generateUndirectedFromDirected(dependences);
  let leaves = detectLeafNode(links, undirectedDependences);
  let topicArr = topics.slice(0);
  for(let key in leaves){
    topicArr.splice(topicArr.indexOf(key), 1);
  }
  //处理links
  let dependenceArr = dependences.slice(0);
  for(let dependence of dependences){
    if(topicArr.indexOf(dependence[0]) === -1 || topicArr.indexOf(dependence[1]) === -1){
      dependenceArr.splice(dependenceArr.indexOf(dependence), 1);
    }
  }
  let undirectedDependenceArr = generateUndirectedFromDirected(dependenceArr);


  let result = caculateEdgeCrossing(topicArr, dependenceArr, undirectedDependenceArr);
  let { edge: selectedEdge, sum: sum } = findKeyOfMaxValue(result);
  
  if(sum !== 0){
    selectedEdge = selectedEdge.split(' ');
    if(undirectedDependenceArr[selectedEdge[0]].length > undirectedDependenceArr[selectedEdge[1]].length){
      topicArr.splice(topicArr.indexOf(selectedEdge[1]), 1);
      topicArr.splice(topicArr.indexOf(selectedEdge[0]), 0, selectedEdge[1]);
    }else{
      topicArr.splice(topicArr.indexOf(selectedEdge[0]), 1);
      topicArr.splice(topicArr.indexOf(selectedEdge[1]), 0, selectedEdge[0]);
    }
  }

  // 加上叶子结点
  for(let key in leaves){
    topicArr.splice(topicArr.indexOf(leaves[key]), 0, key);
  }

  // test
  let r = caculateEdgeCrossing(topicArr, dependences, undirectedDependences);
  console.log(r);
  return topicArr;
}
/**
 * 找到与其他边交叉最多的边，返回这条边'start end'以及交点的数量
 * @param {*} obj 
 */
function findKeyOfMaxValue(obj){
  let tmp = -1;
  let tmpKey = '';
  let sum = 0;
  for(let key in obj){
    sum += obj[key];
    if(obj[key] > tmp){
      tmp = obj[key];
      tmpKey = key;
    }
  }
  return {edge: tmpKey, sum: sum};
}

/**
 * 将二维数组存储的有向图转换为对象存储的无向图
 * @param {*} dependences 
 */
function generateUndirectedFromDirected(dependences){

  let undirectedDependences = {};
  for(let key of dependences){
    if(undirectedDependences[key[0]] === undefined){
      undirectedDependences[key[0]] = [key[1]];
    }else{
      undirectedDependences[key[0]].push(key[1]);
    }
    if(undirectedDependences[key[1]] === undefined){
      undirectedDependences[key[1]] = [key[0]];
    }else{
      undirectedDependences[key[1]].push(key[0]);
    }
  }
  return undirectedDependences;
}

// let tmp = topics;
// for(let i = 0; i < 20; i++){
//   tmp = detectEdgeCrossing(tmp, links);
// }
// topics1 = detectEdgeCrossing(topics, links);
// detectEdgeCrossing(topics1);

/**
 * 计算两个圆圆心连线在两个圆上的交点
 * return { source: [x,y], target: [x,y] }
 */
function caculateLinkSourceTargetBetweenCircles(cx1, cy1, r1, cx2, cy2, r2){
  let x1 = cx1 + r1 * (cx2 - cx1) / Math.sqrt((cx1 - cx2) * (cx1 - cx2) + (cy1 - cy2) * (cy1 - cy2));
  let y1 = cy1 + r1 * (cy2 - cy1) / Math.sqrt((cx1 - cx2) * (cx1 - cx2) + (cy1 - cy2) * (cy1 - cy2));
  let x2 = cx2 - r2 * (cx2 - cx1) / Math.sqrt((cx1 - cx2) * (cx1 - cx2) + (cy1 - cy2) * (cy1 - cy2));
  let y2 = cy2 - r2 * (cy2 - cy1) / Math.sqrt((cx1 - cx2) * (cx1 - cx2) + (cy1 - cy2) * (cy1 - cy2));
  return [{'x': x1, 'y': y1}, {'x': x2, 'y': y2}];
}