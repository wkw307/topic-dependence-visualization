import axios from 'axios';
// import {drawMap} from "./module/topicDependenceVisualization";
import {drawMap} from "./src/draw-map";
import {drawTree} from './module/facetTree';

const Data = [
    {
        startTopicId: 104813,
        endTopicId: 104815,
        startTopicName: '字符',
        endTopicName: '字符编码',
        domainId: -1
    },
    {
        startTopicId: 104802,
        endTopicId: 104837,
        startTopicName: 'C语言',
        endTopicName: '数据类型',
        domainId: -1
    },
    {
        startTopicId: 104837,
        endTopicId: 104841,
        startTopicName: '数据类型',
        endTopicName: '函数',
        domainId: -1
    },
    {
        startTopicId: 104841,
        endTopicId: 104842,
        startTopicName: '函数',
        endTopicName: '系统调用',
        domainId: -1
    },
    {
        startTopicId: 104802,
        endTopicId: 104806,
        startTopicName: 'C语言',
        endTopicName: 'Clang',
        domainId: -1
    },
    {
        startTopicId: 104802,
        endTopicId: 104798,
        startTopicName: 'C语言',
        endTopicName: 'GCC',
        domainId: -1
    },
    {
        startTopicId: 104841,
        endTopicId: 104833,
        startTopicName: '函数',
        endTopicName: '程序调试',
        domainId: -1
    },
    {
        startTopicId: 104837,
        endTopicId: 104836,
        startTopicName: '数据类型',
        endTopicName: '运算符',
        domainId: -1
    },
    {
        startTopicId: 104841,
        endTopicId: 104812,
        startTopicName: '函数',
        endTopicName: '内存管理',
        domainId: -1
    },
    {
        startTopicId: 104841,
        endTopicId: 104796,
        startTopicName: '函数',
        endTopicName: '注释',
        domainId: -1
    },
    {
        startTopicId: 104841,
        endTopicId: 104811,
        startTopicName: '函数',
        endTopicName: '头文件',
        domainId: -1
    },
    {
        startTopicId: 104806,
        endTopicId: 104827,
        startTopicName: 'Clang',
        endTopicName: '预处理指令',
        domainId: -1
    },
    {
        startTopicId: 104798,
        endTopicId: 104827,
        startTopicName: 'GCC',
        endTopicName: '预处理指令',
        domainId: -1
    },
    {
        startTopicId: 104793,
        endTopicId: 104808,
        startTopicName: 'C语言标准库',
        endTopicName: 'C_POSIX_library',
        domainId: -1
    },
    {
        startTopicId: 104837,
        endTopicId: 104794,
        startTopicName: '数据类型',
        endTopicName: '字面常量（C语言）',
        domainId: -1
    },
    {
        startTopicId: 104821,
        endTopicId: 104822,
        startTopicName: '结构体',
        endTopicName: '位域',
        domainId: -1
    },
    {
        startTopicId: 104837,
        endTopicId: 104823,
        startTopicName: '数据类型',
        endTopicName: 'typedef',
        domainId: -1
    },
    {
        startTopicId: 104837,
        endTopicId: 104813,
        startTopicName: '数据类型',
        endTopicName: '字符',
        domainId: -1
    },
    {
        startTopicId: 104814,
        endTopicId: 104817,
        startTopicName: '数组',
        endTopicName: '链表',
        domainId: -1
    },
    {
        startTopicId: 104837,
        endTopicId: 104814,
        startTopicName: '数据类型',
        endTopicName: '数组',
        domainId: -1
    },
    {
        startTopicId: 104837,
        endTopicId: 104843,
        startTopicName: '数据类型',
        endTopicName: '指针',
        domainId: -1
    },
    {
        startTopicId: 104838,
        endTopicId: 104832,
        startTopicName: '控制语句',
        endTopicName: '程序结构',
        domainId: -1
    },
    {
        startTopicId: 104811,
        endTopicId: 104793,
        startTopicName: '头文件',
        endTopicName: 'C语言标准库',
        domainId: -1
    },
    {
        startTopicId: 104802,
        endTopicId: 104809,
        startTopicName: 'C语言',
        endTopicName: 'ANSI_C',
        domainId: -1
    },
    {
        startTopicId: 104823,
        endTopicId: 104818,
        startTopicName: 'typedef',
        endTopicName: '共用体',
        domainId: -1
    },
    {
        startTopicId: 104823,
        endTopicId: 104821,
        startTopicName: 'typedef',
        endTopicName: '结构体',
        domainId: -1
    },
    {
        startTopicId: 104793,
        endTopicId: 104803,
        startTopicName: 'C语言标准库',
        endTopicName: 'C字串函式库',
        domainId: -1
    },
    {
        startTopicId: 104793,
        endTopicId: 104800,
        startTopicName: 'C语言标准库',
        endTopicName: 'C标准函式库',
        domainId: -1
    },
    {
        startTopicId: 104829,
        endTopicId: 104831,
        startTopicName: '标识符',
        endTopicName: '关键字',
        domainId: -1
    },
    {
        startTopicId: 104827,
        endTopicId: 104826,
        startTopicName: '预处理指令',
        endTopicName: '宏定义',
        domainId: -1
    },
    {
        startTopicId: 104813,
        endTopicId: 104830,
        startTopicName: '字符',
        endTopicName: '字符串',
        domainId: -1
    },
    {
        startTopicId: 104830,
        endTopicId: 104829,
        startTopicName: '字符串',
        endTopicName: '标识符',
        domainId: -1
    },
    {
        startTopicId: 104813,
        endTopicId: 104834,
        startTopicName: '字符',
        endTopicName: '转义字符',
        domainId: -1
    },
    {
        startTopicId: 104829,
        endTopicId: 104795,
        startTopicName: '标识符',
        endTopicName: '变量',
        domainId: -1
    },
    {
        startTopicId: 104832,
        endTopicId: 104819,
        startTopicName: '程序结构',
        endTopicName: '选择结构',
        domainId: -1
    },
    {
        startTopicId: 104832,
        endTopicId: 104810,
        startTopicName: '程序结构',
        endTopicName: '顺序结构',
        domainId: -1
    },
    {
        startTopicId: 104832,
        endTopicId: 104820,
        startTopicName: '程序结构',
        endTopicName: '循环结构',
        domainId: -1
    },
    {
        startTopicId: 104795,
        endTopicId: 104835,
        startTopicName: '变量',
        endTopicName: '表达式',
        domainId: -1
    },
    {
        startTopicId: 104795,
        endTopicId: 104839,
        startTopicName: '变量',
        endTopicName: '函数调用',
        domainId: -1
    },
    {
        startTopicId: 104795,
        endTopicId: 104840,
        startTopicName: '变量',
        endTopicName: '指针变量',
        domainId: -1
    },
    {
        startTopicId: 104836,
        endTopicId: 104835,
        startTopicName: '运算符',
        endTopicName: '表达式',
        domainId: -1
    },
    {
        startTopicId: 104841,
        endTopicId: 104839,
        startTopicName: '函数',
        endTopicName: '函数调用',
        domainId: -1
    },
    {
        startTopicId: 104842,
        endTopicId: 104801,
        startTopicName: '系统调用',
        endTopicName: 'Fork（系统调用）',
        domainId: -1
    },
    {
        startTopicId: 104841,
        endTopicId: 104843,
        startTopicName: '函数',
        endTopicName: '指针',
        domainId: -1
    },
    {
        startTopicId: 104841,
        endTopicId: 104838,
        startTopicName: '函数',
        endTopicName: '控制语句',
        domainId: -1
    },
    {
        startTopicId: 104802,
        endTopicId: 104797,
        startTopicName: 'C语言',
        endTopicName: 'Objective-C',
        domainId: -1
    },
    {
        startTopicId: 104802,
        endTopicId: 104799,
        startTopicName: 'C语言',
        endTopicName: 'Go',
        domainId: -1
    },
    {
        startTopicId: 104802,
        endTopicId: 104807,
        startTopicName: 'C语言',
        endTopicName: 'C++',
        domainId: -1
    },
    {
        startTopicId: 104802,
        endTopicId: 104804,
        startTopicName: 'C语言',
        endTopicName: 'C#',
        domainId: -1
    },
    {
        startTopicId: 104802,
        endTopicId: 104805,
        startTopicName: 'C语言',
        endTopicName: 'C11',
        domainId: -1
    }
];

async function clickFacet(facetId: number) {

    try {
        const res = await axios.get('http://yotta.xjtushilei.com:8083/facet/getFacetNameAndParentFacetNameByFacetId', {
            params: {
                facetId,
            }
        });
        if ((res as any).data.code === 200) {
            document.getElementById('facet').innerHTML = (res.data.data.parentFacetName ?  res.data.data.parentFacetName + ' - ' : '') + res.data.data.facetName;
        } else {
            throw(res.data)
        }
    } catch (e) {
        console.log(e);
        document.getElementById('facet').innerHTML = '';
    }

    // empty list
    const list = document.getElementById('list');
    const children = list.childNodes;
    for (let i = 0; i < children.length; i++) {
        list.removeChild(children[i]);
    }

    const ul = document.createElement('ul');
    let assembleNumber = 0;

    try {
        const res = await axios.get('http://yotta.xjtushilei.com:8083/assemble/getAssemblesByFacetId', {
            params: {
                facetId: facetId,
            },
        });

        if ((res as any).data.code === 200) {
            const assembleList = res.data.data;
            (assembleList as any).forEach(element => {
                const li = document.createElement('li');
                li.className = 'assemble';
                if (element.type === 'video') {
                    const regex = new RegExp('https://.*mp4');
                    li.innerHTML = `<video src='${regex.exec(element.assembleContent as string)[0]}' controls height="280"></video>`
                } else {
                    li.innerHTML = element.assembleContent;
                }
                ul.appendChild(li);
            });
            assembleNumber = assembleList.length;
            list.appendChild(ul);
            document.getElementById('assembleNumber').innerHTML = assembleNumber.toString();
        } else {
            throw ('api error');
        }
    } catch (e) {
        console.log(e);
        document.getElementById('assembleNumber').innerHTML = '';
    }

}
const treesvg = document.getElementById('tree');

const svg = document.getElementById('map');
drawMap(svg, treesvg, Data, (topicId, topicName) => {
    console.log(topicId, topicName)
    if (topicId !== -1 && topicName) {
        axios.post('http://yotta.xjtushilei.com:8083/topic/getCompleteTopicByTopicName?topicName=' + encodeURIComponent(topicName) + '&hasFragment=emptyAssembleContent').then(res => {
            // drawTree(treesvg, res.data.data, clickFacet);
        }).catch(err => console.log(err))
    }
});