import { cloneDeep } from 'lodash';

interface RelationRes {
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
function parseAPI(data: RelationRes[]): { topics: { [p: number]: string }, relations: { [p: number]: number[] }} {
    const topics = {};
    const relations = {};
    for (let relation of data) {
        topics[relation.startTopicId] = relation.startTopicName;
        topics[relation.endTopicId] = relation.endTopicName;
        if (relations[relation.startTopicId] === undefined) {
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
function preProcess(relations) {
    const resultPaths = [];
    // 找出所有路径
    const paths: Array<Array<number>> = [];
    for (let key in relations) {
        if (relations.hasOwnProperty(key)) {
            paths.push([parseInt(key)]);
        }
    }
    while (paths.length > 0) {
        const currPath = paths.shift();
        const currTopic = currPath[currPath.length - 1];
        if (relations[currTopic] === undefined) {
            resultPaths.push(currPath);
        } else {
            for (let key of relations[currTopic]) {
                const tmp = cloneDeep(currPath);
                tmp.push(parseInt(key));
                paths.push(tmp);
            }
        }
    }

}