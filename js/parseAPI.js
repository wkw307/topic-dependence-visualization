var paths = [];
function parseAPI(data, domainId){
  let topicList = {};
  let dependenceList = new Set();
  for(let dependece of data){
    if(topicList[dependece.startTopicId] === undefined){
      topicList[dependece.startTopicId] =  dependece.startTopicName;
    } 
    if(topicList[dependece.endTopicId] === undefined){
      topicList[dependece.endTopicId] =  dependece.endTopicName;
    } 
    if(dependece.startTopicId !== dependece.endTopicId){
      dependenceList.add([dependece.startTopicId, dependece.endTopicId]);
    }
  }

  let hashTable = {};
  for(let dependence of dependenceList.values()){
    if(hashTable[dependence[0]] !== undefined){
      hashTable[dependence[0]].add(dependence[1]);  
    }else{
      hashTable[dependence[0]] = new Set();
      hashTable[dependence[0]].add(dependence[1]); 
    }
  }

  // 找出只有入度的节点
  let startTopics = [];
  let endTopics = [];
  for(let topicId in hashTable){
    startTopics.push(topicId);
    endTopics = endTopics.concat([...hashTable[topicId]]);
  }
  endTopics = new Set(endTopics);
  endTopics = [...endTopics];
  let lonelyTopics = startTopics.filter(x => endTopics.indexOf(parseInt(x)) === -1);

  for(let topicId of lonelyTopics){
    if(topicId !== domainId){
      hashTable[domainId].add(topicId);
    }
  }

  paths = [];
  findPath(paths, domainId, hashTable);
  p = paths.map(el => el.join(','));
  let forwardPathCount = 0;
  for(let topicId in hashTable){
    for(let endTopic of hashTable[topicId].values()){
      let reg = new RegExp(topicId + ',.*,' + endTopic.toString() + '[, | $]');
      for(let path of p){
        if(reg.test(path)){
          hashTable[topicId].delete(endTopic);
          forwardPathCount ++;
          break;
        }
      }
    }
  }
  console.log('删去前向边(条):' + forwardPathCount);

  let topicCount = 0;
  for(let topic in topicList){
    topicCount ++;
  }
  let dependeceCount = 0;
  for(let topicId in hashTable){
    hashTable[topicId] = [...hashTable[topicId]];
    dependeceCount += hashTable[topicId].length;
  }
  console.log(`节点:${topicCount} 边:${dependeceCount}`);
  return {topics: topicList, dependeces: hashTable};

}

function findPath(arr = [], topicId, hashTable){
  if(hashTable[topicId] === undefined){
    let a = arr.slice();
    a.push(topicId);
    paths.push(a);
  }else{
    let result = arr.slice(0);
    result.push(topicId);
    for(let topic of hashTable[topicId].values()){
      findPath(result, topic, hashTable);
    }
  }
}

module.exports = parseAPI;