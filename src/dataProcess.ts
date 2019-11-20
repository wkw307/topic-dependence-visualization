import { cloneDeep } from 'lodash';
import * as R from 'r-script';
import * as fs from 'fs';
import * as path from 'path';

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
function preProcess(topics, relations) {
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
                entranceTopicIds.push(topicId);
            }
        }
    }
    resultRelations[-1] = entranceTopicIds;
    return resultRelations;
}

/**
 * 知识簇划分
 * @param rScriptPath
 * @param topics
 * @param relations
 * @param output
 */
function calCommunity(rScriptPath: string,
                      topics: { [p: number]: string },
                      relations: { [p: number]: number[] },
                      output: string,
                      ) {
    if (!fs.existsSync('./tmp')) {
        fs.mkdirSync('./tmp')
    }
    let topicStr = '';
    for (let key in topics) {
        topicStr += key.toString() + ' ' + topics[key] + '\n';
    }
    fs.writeFileSync('./tmp/topic.txt', topicStr, {encoding: 'utf8'});
    let relationStr = '';
    for (let key in relations) {
        for (let endTopic of relations[key]) {
            relationStr += key.toString() + ' ' + endTopic.toString() + '\n';
        }
    }
    fs.writeFileSync('./tmp/relation.txt', relationStr, {encoding: 'utf8'});
    const out = R(rScriptPath)
        .data(
            path.join(__dirname, './tmp/topic.txt'),
            path.join(__dirname, './tmp/relation.txt'),
            output
        )
        .callSync();
    console.log(out);
}

const res = [{"dependencyId":null,"startTopicId":104843,"endTopicId":104840,"confidence":0.0,"domainId":412,"startTopicName":"指针","endTopicName":"指针变量"},{"dependencyId":null,"startTopicId":104795,"endTopicId":104840,"confidence":0.0,"domainId":412,"startTopicName":"变量","endTopicName":"指针变量"},{"dependencyId":null,"startTopicId":104837,"endTopicId":104839,"confidence":0.0,"domainId":412,"startTopicName":"数据类型","endTopicName":"函数调用"},{"dependencyId":null,"startTopicId":104797,"endTopicId":104806,"confidence":0.0,"domainId":412,"startTopicName":"Objective-C","endTopicName":"Clang"},{"dependencyId":null,"startTopicId":104832,"endTopicId":104838,"confidence":0.0,"domainId":412,"startTopicName":"程序结构","endTopicName":"控制语句"},{"dependencyId":null,"startTopicId":104795,"endTopicId":104839,"confidence":0.0,"domainId":412,"startTopicName":"变量","endTopicName":"函数调用"},{"dependencyId":null,"startTopicId":104837,"endTopicId":104794,"confidence":0.0,"domainId":412,"startTopicName":"数据类型","endTopicName":"字面常量（C语言）"},{"dependencyId":null,"startTopicId":104837,"endTopicId":104817,"confidence":0.0,"domainId":412,"startTopicName":"数据类型","endTopicName":"链表"},{"dependencyId":null,"startTopicId":104837,"endTopicId":104818,"confidence":0.0,"domainId":412,"startTopicName":"数据类型","endTopicName":"共用体"},{"dependencyId":null,"startTopicId":104794,"endTopicId":104835,"confidence":0.0,"domainId":412,"startTopicName":"字面常量（C语言）","endTopicName":"表达式"},{"dependencyId":null,"startTopicId":104795,"endTopicId":104835,"confidence":0.0,"domainId":412,"startTopicName":"变量","endTopicName":"表达式"},{"dependencyId":null,"startTopicId":104813,"endTopicId":104809,"confidence":0.0,"domainId":412,"startTopicName":"字符","endTopicName":"ANSI_C"},{"dependencyId":null,"startTopicId":104813,"endTopicId":104834,"confidence":0.0,"domainId":412,"startTopicName":"字符","endTopicName":"转义字符"},{"dependencyId":null,"startTopicId":104832,"endTopicId":104820,"confidence":0.0,"domainId":412,"startTopicName":"程序结构","endTopicName":"循环结构"},{"dependencyId":null,"startTopicId":104832,"endTopicId":104810,"confidence":0.0,"domainId":412,"startTopicName":"程序结构","endTopicName":"顺序结构"},{"dependencyId":null,"startTopicId":104832,"endTopicId":104819,"confidence":0.0,"domainId":412,"startTopicName":"程序结构","endTopicName":"选择结构"},{"dependencyId":null,"startTopicId":104813,"endTopicId":104831,"confidence":0.0,"domainId":412,"startTopicName":"字符","endTopicName":"关键字"},{"dependencyId":null,"startTopicId":104829,"endTopicId":104794,"confidence":0.0,"domainId":412,"startTopicName":"标识符","endTopicName":"字面常量（C语言）"},{"dependencyId":null,"startTopicId":104813,"endTopicId":104830,"confidence":0.0,"domainId":412,"startTopicName":"字符","endTopicName":"字符串"},{"dependencyId":null,"startTopicId":104827,"endTopicId":104826,"confidence":0.0,"domainId":412,"startTopicName":"预处理指令","endTopicName":"宏定义"},{"dependencyId":null,"startTopicId":104833,"endTopicId":104827,"confidence":0.0,"domainId":412,"startTopicName":"程序调试","endTopicName":"预处理指令"},{"dependencyId":null,"startTopicId":104802,"endTopicId":104793,"confidence":0.0,"domainId":412,"startTopicName":"C语言","endTopicName":"C语言标准库"},{"dependencyId":null,"startTopicId":104836,"endTopicId":104824,"confidence":0.0,"domainId":412,"startTopicName":"运算符","endTopicName":"位运算"},{"dependencyId":null,"startTopicId":104836,"endTopicId":104835,"confidence":0.0,"domainId":412,"startTopicName":"运算符","endTopicName":"表达式"},{"dependencyId":null,"startTopicId":104793,"endTopicId":104800,"confidence":0.0,"domainId":412,"startTopicName":"C语言标准库","endTopicName":"C标准函式库"},{"dependencyId":null,"startTopicId":104793,"endTopicId":104803,"confidence":0.0,"domainId":412,"startTopicName":"C语言标准库","endTopicName":"C字串函式库"},{"dependencyId":null,"startTopicId":104842,"endTopicId":104801,"confidence":0.0,"domainId":412,"startTopicName":"系统调用","endTopicName":"Fork（系统调用）"},{"dependencyId":null,"startTopicId":104837,"endTopicId":104823,"confidence":0.0,"domainId":412,"startTopicName":"数据类型","endTopicName":"typedef"},{"dependencyId":null,"startTopicId":104837,"endTopicId":104822,"confidence":0.0,"domainId":412,"startTopicName":"数据类型","endTopicName":"位域"},{"dependencyId":null,"startTopicId":104802,"endTopicId":104811,"confidence":0.0,"domainId":412,"startTopicName":"C语言","endTopicName":"头文件"},{"dependencyId":null,"startTopicId":104837,"endTopicId":104813,"confidence":0.0,"domainId":412,"startTopicName":"数据类型","endTopicName":"字符"},{"dependencyId":null,"startTopicId":104837,"endTopicId":104821,"confidence":0.0,"domainId":412,"startTopicName":"数据类型","endTopicName":"结构体"},{"dependencyId":null,"startTopicId":104807,"endTopicId":104811,"confidence":0.0,"domainId":412,"startTopicName":"C++","endTopicName":"头文件"},{"dependencyId":null,"startTopicId":104802,"endTopicId":104808,"confidence":0.0,"domainId":412,"startTopicName":"C语言","endTopicName":"C_POSIX_library"},{"dependencyId":null,"startTopicId":104807,"endTopicId":104805,"confidence":0.0,"domainId":412,"startTopicName":"C++","endTopicName":"C11"},{"dependencyId":null,"startTopicId":104802,"endTopicId":104798,"confidence":0.0,"domainId":412,"startTopicName":"C语言","endTopicName":"GCC"},{"dependencyId":null,"startTopicId":104797,"endTopicId":104798,"confidence":0.0,"domainId":412,"startTopicName":"Objective-C","endTopicName":"GCC"},{"dependencyId":null,"startTopicId":104802,"endTopicId":104806,"confidence":0.0,"domainId":412,"startTopicName":"C语言","endTopicName":"Clang"},{"dependencyId":null,"startTopicId":104833,"endTopicId":104842,"confidence":0.0,"domainId":412,"startTopicName":"程序调试","endTopicName":"系统调用"},{"dependencyId":null,"startTopicId":104802,"endTopicId":104804,"confidence":0.0,"domainId":412,"startTopicName":"C语言","endTopicName":"C#"},{"dependencyId":null,"startTopicId":104807,"endTopicId":104804,"confidence":0.0,"domainId":412,"startTopicName":"C++","endTopicName":"C#"},{"dependencyId":null,"startTopicId":104799,"endTopicId":104798,"confidence":0.0,"domainId":412,"startTopicName":"Go","endTopicName":"GCC"},{"dependencyId":null,"startTopicId":104793,"endTopicId":104808,"confidence":0.0,"domainId":412,"startTopicName":"C语言标准库","endTopicName":"C_POSIX_library"},{"dependencyId":null,"startTopicId":104813,"endTopicId":104816,"confidence":0.0,"domainId":412,"startTopicName":"字符","endTopicName":"进位计数制"},{"dependencyId":null,"startTopicId":104802,"endTopicId":104797,"confidence":0.0,"domainId":412,"startTopicName":"C语言","endTopicName":"Objective-C"},{"dependencyId":null,"startTopicId":104802,"endTopicId":104843,"confidence":0.0,"domainId":412,"startTopicName":"C语言","endTopicName":"指针"},{"dependencyId":null,"startTopicId":104807,"endTopicId":104843,"confidence":0.0,"domainId":412,"startTopicName":"C++","endTopicName":"指针"},{"dependencyId":null,"startTopicId":104794,"endTopicId":104839,"confidence":0.0,"domainId":412,"startTopicName":"字面常量（C语言）","endTopicName":"函数调用"},{"dependencyId":null,"startTopicId":104837,"endTopicId":104795,"confidence":0.0,"domainId":412,"startTopicName":"数据类型","endTopicName":"变量"},{"dependencyId":null,"startTopicId":104837,"endTopicId":104814,"confidence":0.0,"domainId":412,"startTopicName":"数据类型","endTopicName":"数组"},{"dependencyId":null,"startTopicId":104813,"endTopicId":104836,"confidence":0.0,"domainId":412,"startTopicName":"字符","endTopicName":"运算符"},{"dependencyId":null,"startTopicId":104835,"endTopicId":104828,"confidence":0.0,"domainId":412,"startTopicName":"表达式","endTopicName":"输入输出"},{"dependencyId":null,"startTopicId":104802,"endTopicId":104825,"confidence":0.0,"domainId":412,"startTopicName":"C语言","endTopicName":"基本语法"},{"dependencyId":null,"startTopicId":104800,"endTopicId":104839,"confidence":0.0,"domainId":412,"startTopicName":"C标准函式库","endTopicName":"函数调用"},{"dependencyId":null,"startTopicId":104808,"endTopicId":104842,"confidence":0.0,"domainId":412,"startTopicName":"C_POSIX_library","endTopicName":"系统调用"},{"dependencyId":null,"startTopicId":104813,"endTopicId":104815,"confidence":0.0,"domainId":412,"startTopicName":"字符","endTopicName":"字符编码"},{"dependencyId":null,"startTopicId":104802,"endTopicId":104805,"confidence":0.0,"domainId":412,"startTopicName":"C语言","endTopicName":"C11"},{"dependencyId":null,"startTopicId":104832,"endTopicId":104833,"confidence":0.0,"domainId":412,"startTopicName":"程序结构","endTopicName":"程序调试"},{"dependencyId":null,"startTopicId":104802,"endTopicId":104807,"confidence":0.0,"domainId":412,"startTopicName":"C语言","endTopicName":"C++"},{"dependencyId":null,"startTopicId":104802,"endTopicId":104833,"confidence":0.0,"domainId":412,"startTopicName":"C语言","endTopicName":"程序调试"},{"dependencyId":null,"startTopicId":104813,"endTopicId":104803,"confidence":0.0,"domainId":412,"startTopicName":"字符","endTopicName":"C字串函式库"},{"dependencyId":null,"startTopicId":104802,"endTopicId":104835,"confidence":0.0,"domainId":412,"startTopicName":"C语言","endTopicName":"表达式"},{"dependencyId":null,"startTopicId":104802,"endTopicId":104832,"confidence":0.0,"domainId":412,"startTopicName":"C语言","endTopicName":"程序结构"},{"dependencyId":null,"startTopicId":104802,"endTopicId":104829,"confidence":0.0,"domainId":412,"startTopicName":"C语言","endTopicName":"标识符"},{"dependencyId":null,"startTopicId":104802,"endTopicId":104812,"confidence":0.0,"domainId":412,"startTopicName":"C语言","endTopicName":"内存管理"},{"dependencyId":null,"startTopicId":104802,"endTopicId":104838,"confidence":0.0,"domainId":412,"startTopicName":"C语言","endTopicName":"控制语句"},{"dependencyId":null,"startTopicId":104802,"endTopicId":104796,"confidence":0.0,"domainId":412,"startTopicName":"C语言","endTopicName":"注释"},{"dependencyId":null,"startTopicId":104807,"endTopicId":104812,"confidence":0.0,"domainId":412,"startTopicName":"C++","endTopicName":"内存管理"},{"dependencyId":null,"startTopicId":104807,"endTopicId":104838,"confidence":0.0,"domainId":412,"startTopicName":"C++","endTopicName":"控制语句"},{"dependencyId":null,"startTopicId":104805,"endTopicId":104796,"confidence":0.0,"domainId":412,"startTopicName":"C11","endTopicName":"注释"}];
const { topics, relations } = parseAPI(res);
const preRelation = preProcess(topics, relations);
calCommunity(path.join(__dirname, '../rscript/communityDiscovery.r').toString(), topics, relations, './tmp/');