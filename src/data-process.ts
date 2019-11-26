import { cloneDeep } from 'lodash';
import * as R from 'r-script';
import * as fs from 'fs';
import * as path from 'path';

export interface RelationRes {
    startTopicId: number;
    endTopicId: number;
    startTopicName: string;
    endTopicName: string;
    domainId: number;
}

/**
 * 解析api数据
 * @param data
 */
export function parseAPI(data: RelationRes[]): { topics: { [p: number]: string }, relations: { [p: number]: number[] }} {
    const topics = {};
    const relations = {};
    for (let relation of data) {
        topics[relation.startTopicId] = relation.startTopicName;
        topics[relation.endTopicId] = relation.endTopicName;
        if (!relations[relation.startTopicId]) {
            relations[relation.startTopicId] = [relation.endTopicId];
        } else {
            relations[relation.startTopicId].push(relation.endTopicId);
        }
    }
    return { topics, relations };
}

/**
 * 删除前向边，入度为零的点均挂载到虚拟节点上
 */
export function preProcess(topics, relations) {
    const resultPaths = [];
    const resultRelations = {};
    // 找出所有路径
    const paths: Array<Array<number>> = [];
    for (let key in relations) {
        if (relations.hasOwnProperty(key)) {
            paths.push([parseInt(key)]);
            resultRelations[parseInt(key)] = [];
        }
    }
    while (paths.length > 0) {
        const currPath = paths.shift();
        const currTopic = currPath[currPath.length - 1];
        if (!relations[currTopic]) {
            resultPaths.push(currPath);
        } else {
            for (let key of relations[currTopic]) {
                const tmp = cloneDeep(currPath);
                tmp.push(parseInt(key));
                paths.push(tmp);
            }
        }
    }
    // 找出前向边
    const forwardEdge = [];
    for (let key in relations) {
        if (relations.hasOwnProperty(key)) {
            for (let endTopicId of relations[key]) {
                let flag = true;
                for (let arr of resultPaths) {
                    if (arr.indexOf(key) !== -1 && arr.indexOf(endTopicId) !== -1 && arr.indexOf(endTopicId) - arr.indexOf(key) > 1) {
                        // key -> endTopicId 是前向边
                        forwardEdge.push([key, endTopicId]);
                        flag = false;
                        break;
                    }
                }
                if (flag) {
                    resultRelations[key].push(endTopicId);
                }
            }
        }
    }
    // 找出入度为0的节点
    const entranceTopicIds = [];
    for (let topicId in topics) {
        if (topics.hasOwnProperty(topicId)) {
            let flag = true;
            for (let key in resultRelations) {
                if (resultRelations[key].indexOf(topicId) !== -1) {
                    flag = false;
                    break;
                }
            }
            if (flag) {
                entranceTopicIds.push(parseInt(topicId));
            }
        }
    }
    if (entranceTopicIds.length) {
        resultRelations[-1] = entranceTopicIds;
    }
    return resultRelations;
}

/**
 * 知识簇划分
 * @param rScriptPath
 * @param topics
 * @param relations
 * @param output
 */
export function calCommunity(rScriptPath: string,
                      topics: { [p: number]: string },
                      relations: { [p: number]: number[] },
                      output: string,
                      ) {
    if (!fs.existsSync(path.join(__dirname, './tmp'))) {
        fs.mkdirSync(path.join(__dirname, './tmp'))
    }
    let topicStr = '';
    for (let key in topics) {
        topicStr += key.toString() + ' ' + topics[key] + '\n';
    }
    fs.writeFileSync(path.join(__dirname, './tmp/topic.txt'), topicStr, {encoding: 'utf8'});
    let relationStr = '';
    for (let key in relations) {
        for (let endTopic of relations[key]) {
            relationStr += key.toString() + ' ' + endTopic.toString() + '\n';
        }
    }
    fs.writeFileSync(path.join(__dirname, './tmp/relation.txt'), relationStr, {encoding: 'utf8'});
    const out = R(rScriptPath)
        .data(
            path.join(__dirname, './tmp/topic.txt'),
            path.join(__dirname, './tmp/relation.txt'),
            output
        )
        .callSync();
    const graph = {};
    const topicId2Community = {};
    const relationCrossCommunity = [];
    const communityRelation = {};
    const community = fs.readFileSync(path.join(output, out.split(' ')[0] + '.txt'), { encoding: 'utf8'}).split('\n');
    for (let i = 1; i < community.length - 1; i++) {
        const line = community[i];
        const topicId = parseInt(line.split(' ')[1].replace(/"/g, ''));
        const communityId = parseInt(line.split(' ')[2].replace(/"/g, ''));
        if (graph.hasOwnProperty(communityId)) {
            graph[communityId][topicId] = [];
        } else {
            graph[communityId] = {};
            graph[communityId][topicId] = [];
        }
        topicId2Community[topicId] = communityId;
    }
    for (const key in graph) {
        for (const startTopicId in graph[key]) {
            if (relations.hasOwnProperty(startTopicId)) {
                for (const endTopicId of relations[startTopicId]) {
                    if (graph[key].hasOwnProperty(endTopicId)) {
                        if (graph[key][startTopicId]) {
                            graph[key][startTopicId].push(parseInt(endTopicId));
                        } else {
                            graph[key][startTopicId] = [parseInt(endTopicId)];
                        }
                    } else {
                        relationCrossCommunity.push([parseInt(startTopicId), parseInt(endTopicId)]);
                        if (communityRelation[topicId2Community[startTopicId]]) {
                            communityRelation[topicId2Community[startTopicId]].push(topicId2Community[endTopicId]);
                        } else {
                            communityRelation[topicId2Community[startTopicId]] = [topicId2Community[endTopicId]];
                        }
                    }
                }
            }
        }
    }
    for (let com in graph) {
        if (communityRelation[com]) {
            communityRelation[com] = Array.from(new Set(communityRelation[com]));
        } else {
            communityRelation[com] = [];
        }
    }
    return {
        graph,
        topicId2Community,
        relationCrossCommunity,
        communityRelation,
    }
}
