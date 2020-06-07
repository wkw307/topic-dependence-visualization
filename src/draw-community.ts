import * as d3 from 'd3';
import axios from 'axios';
import { presetPalettes } from '@ant-design/colors';
import { drawTree } from 'facet-tree-visualization';
import {gaozhongshuxue} from '../gaozhongshuxue'
// import {drawMap} from "./module/topicDependenceVisualization";


// import {drawTree} from './module/facetTree';

import {
    calcCircleLayout,
    calcCircleLayoutSecondLayer,
    calcCircleLayoutSecondLayer1,
    calcCircleLayoutWithoutReduceCrossing,
    calcEdgeWithSelectedNode, calcEdgeWithSelectedNodeCrossCom,
    calcEdgeWithSelectedComCrossCom,
    calcLinkSourceTargetBetweenCircles,
    calNodeWithSelectedInComCrossCom,
    calNodeWithSelectedOutComCrossCom
} from "./circle-layout";
import { drawtopic } from './draw-topic';

const colors = [];
for (let key in presetPalettes) {
    colors.push(presetPalettes[key].slice(0, 10));
}

export interface MapData {
    topics: {[p:string]: string},
    resultRelations: {[p:string]: number[]};
    graph: {[p: string]: {
        [p:string]: number[]
    }};
    topicId2Community: {[p:string]: number};
    relationCrossCommunity: [number, number][];
    communityRelation: {[p: string]: number[]}
}

export async function drawcommunity(
    mapData: MapData,//后端返回的数据
    svg: HTMLElement,//画整张图需要的svg
    treeSvg: HTMLElement,//画分面树需要的svg,是通过css设置浮在上面的，其宽高是根据主题个数计算的
    domainName: string,
    learningPath: number[] = [],//这个是后期用到的，也不用传
   // clickcom,//点击簇时的回调函数，点击簇，画这个簇内部的主题布局，返回与这个簇相关的簇
    clickTopic,//点击主题时的回调函数
    clickFacet,//点击分面时的回调函数
) {
    let {
        topics,
        resultRelations,
        graph,
        topicId2Community,
        relationCrossCommunity,
        communityRelation,
    } = mapData;
    let layer = 0;
    const canvas = d3.select(svg);//整个认知关系的画布
    //用来显示画簇的认知关系，鼠标附上去会显示簇
    const divTooltip = d3.select('body').append('div')
        .style('position', 'absolute')
        .style('opacity', 0)
        .style('text-align', 'center')
        .style('font-size', '6px')
        .style('background-color', '#ffffb8')
        .style('padding', '1px 3px')
        .style('top', 0);
    //用来画箭头，设置箭头模板，是用Id来控制的
    const defs = canvas.append("defs");
    const arrow = defs.append("marker")
        .attr("id", "arrow")
        .attr("markerUnits", "strokeWidth")
        .attr("markerWidth", "6")
        .attr("markerHeight", "6")
        .attr("viewBox", "0 0 12 12")
        .attr("refX", "6")
        .attr("refY", "6")
        .attr("orient", "auto");
    const arrow_path = "M2,2 L10,6 L2,10 L6,6 L2,2";
    arrow.append("path")
        .attr("d", arrow_path)
        .attr("fill", '#873800');
    for (let i = 0; i < colors.length; i++) {
        const arrowMarker = defs.append("marker")
            .attr("id", "arrow" + i)
            .attr("markerUnits", "strokeWidth")
            .attr("markerWidth", "8")
            .attr("markerHeight", "8")
            .attr("viewBox", "0 0 12 12")
            .attr("refX", "6")
            .attr("refY", "6")
            .attr("orient", "auto");
        const arrow_path = "M2,2 L10,6 L2,10 L6,6 L2,2";
        arrowMarker.append("path")
            .attr("d", arrow_path)
            .attr("fill", colors[i][9]);
    }
    //画线的代码，用来生成d3画线需要的数据
    const link: any = d3.line()
        // @ts-ignore
        .x(function (d) { return d.x })
        // @ts-ignore
        .y(function (d) { return d.y })
        .curve(d3.curveCatmullRom.alpha(0.5));
    
    for (let key in graph) {
        graph[key] = completeObj(graph[key]);
    }
    // 补全键名，键名是所有的topic_id
    communityRelation = completeObj(communityRelation);
    // 画外面的大圆
    const radius = svg.clientHeight < svg.clientWidth ? svg.clientHeight / 2 - 24 : svg.clientWidth / 2 - 24;
    //整张大圆的圆心、半径、簇和簇之间认知关系的数据
    //判断有没有起始簇，入度为0的点只有一个的话就不需要加上开始，如果有多个入度为0的点则需要加上一个开始节点？？不是这个意思
    //使得入度为0的点放在每一个圆的12.方向
    const { nodes, edges, sequence } = calcCircleLayout(
        { x: radius, y: radius },
        radius,
        communityRelation,
        topicId2Community[-1] !== undefined ? topicId2Community[-1] : undefined
    );
    const globalSequence = sequence;
    const treesvg = document.getElementById('tree');
    const sequences = {};
    const zoom = {
        com: undefined,
        topicId: undefined,
    };
    /**
     * 绘制簇间认知关系
     */
    // 绘制簇间认知关系
    canvas.append('g')
        .attr('id', 'com2com')
        .selectAll('path')
        .data(edges)
        .enter()
        .append('path')
        .attr('d', d => link(d.path))
        .attr('stroke', '#873800')
        .attr('stroke-width', 4)
        .attr('fill', 'none')
        .style('cursor', 'pointer')
        .style('visibility', learningPath.length !== 0 ? 'hidden' : 'visible')
        .on('mouseover', d => {
            let topic = '';
            for (let edge of relationCrossCommunity) {
                if (topicId2Community[edge[0]] === d.start && topicId2Community[edge[1]] === d.end) {
                    topic += topics[edge[0]] + '->' + topics[edge[1]] + '\n';
                }
            }
            divTooltip.transition()
                .duration(200)
                .style("opacity", .9);
            divTooltip.html(topic.trim())
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function (d) {
            divTooltip.transition()
                .duration(500)
                .style("opacity", 0);
        })
        .attr('marker-end', 'url(#arrow)');
    // 绘制知识簇
    canvas.append('g')
        .attr('id', 'com')
        .selectAll('circle')
        .data(nodes)
        .enter()
        .append('circle')
        .attr('r', d => d.r)
        .attr('cx', d => d.cx)
        .attr('cy', d => d.cy)
        .attr('id', d => 'com' + d.id)
        .attr('fill', (d, i) => colors[i % colors.length][1]);
    console.log("nodes",nodes)
    console.log("edges",edges)
    console.log("topics",topics)
    let nodePositions = {};
    // 绘制簇内信息
   for (let com of nodes) {
    // 计算簇内布局
    const tmp = calcCircleLayout(
        { x: com.cx, y: com.cy },
        com.r,
        graph[com.id],
        com.id === topicId2Community[-1] ? -1 : undefined
    );
    console.log("tmp",'tmp')
    for (let node of tmp.nodes) {
        nodePositions[node.id] = node;
    }
    sequences[com.id] = tmp.sequence;
    canvas.append('g')
        .attr('id', com.id + 'edges')
        .selectAll('path')
        .data(tmp.edges)
        .enter()
        .append('path')
        .attr('d', d => link(d.path))
        .attr('stroke', colors[globalSequence.indexOf(com.id) % colors.length][8])
        .attr('stroke-width', 2)
        .attr('fill', 'none')
        .attr('marker-end', 'url(#arrow' + globalSequence.indexOf(com.id) + ')')
        .style('visibility', learningPath.length !== 0 ? 'hidden' : 'visible')
        .attr('display', 'none');
    canvas.append('g')
        .attr('id', com.id + 'nodes')
        .selectAll('circle')
        .data(tmp.nodes)
        .enter()
        .append('circle')
        .attr('r', d => d.r)
        .attr('cx', d => d.cx)
        .attr('cy', d => d.cy)
        .attr('id', d => d.id)
        .attr('fill', colors[globalSequence.indexOf(com.id) % colors.length][6])
        .attr('display', 'none');
    canvas.append('g')
        .attr('id', com.id + 'text')
        .selectAll('text')
        .data(tmp.nodes)
        .enter()
        .append('text')
        .attr('font-size', d => {
            const tmp = (d.r * 2 - 4) / judgementStringLengthWithChinese(topics[d.id]);
            if (tmp > 24) {
                return 24;
            } else {
                return tmp;
            }
        })
        .attr('x', d => {
            const tmp = (d.r * 2 - 4) / judgementStringLengthWithChinese(topics[d.id]);
            if (tmp > 24) {
                return d.cx - 12 * judgementStringLengthWithChinese(topics[d.id]);
            } else {
                return d.cx - tmp / 2 * judgementStringLengthWithChinese(topics[d.id]);
            }
        })
        .attr('y', d => d.cy + (d.r - 2) / judgementStringLengthWithChinese(topics[d.id]))
        .text(d => topics[d.id])
        .attr('fill', '#ffffff')
        .attr('cursor', 'pointer')
        .attr('display', 'none');
}
    // 绘制知识簇上的文本
    canvas.append('g')
        .attr('id', 'comText')
        .selectAll('text')
        .data(nodes)
        .enter()
        .append('text')
        //.attr('font-size', 28)
        .attr('font-size', d => {
           
                const tmp = (d.r * 2 - 4) / judgementStringLengthWithChinese(topics[sequences[d.id][0]]);
                if (tmp > 24) {
                    return 24;
                }
                return tmp;
        })
        .attr('x', d => {
            const tmp = (d.r * 2 - 4) / judgementStringLengthWithChinese(topics[sequences[d.id][0]]);
            if (tmp > 24) {
                return d.cx - 12 * judgementStringLengthWithChinese(topics[sequences[d.id][0]]);
            } else {
                return d.cx - tmp / 2 * judgementStringLengthWithChinese(topics[sequences[d.id][0]]);
            }
        })
        .attr('y', (d, i) => {
            return d.cy;
        })
        .text(d => topics[sequences[d.id][0]])
        .attr('fill', '#000000')
        .attr('cursor', 'pointer')
    
    /**
     * 设置簇的交互操作，点击簇，跳转到画主题的函数
     */
    canvas.select('#com')
        .selectAll('circle')
        .on('click', d => clickCom(d));
    canvas.select('#comText')
        .selectAll('text')
        .on('click', d => clickCom(d));
    // 点击簇时的交互逻辑
    function clickCom(d: any) {
        drawtopic(d.id,gaozhongshuxue, svg, treesvg, domainName, (topicId, topicName) => {console.log(topicId,topicName)}, clickFacet);     
        
    }
       
    }


function completeObj(obj) {
    let ids = new Set();
    for (let key in obj) {
        ids.add(parseInt(key));
        for (let end of obj[key]) {
            ids.add(parseInt(end));
        }
    }
    let _ids = <number[]>Array.from(ids);
    for (let key of _ids) {
        if (!obj[key]) {
            obj[key] = [];
        }
    }
    return obj;
}
function judgementStringLengthWithChinese(str: string): number {
    let result = 0;
    for (let i = 0; i < str.length; i++) {
        if (/[a-z0-9\*\\\|\(\)\&\^\%\$\#\@\!\,\.\?\<\>\/]/.test(str[i])) {
            result += 0.5;
        } else {
            result += 1;
        }
    }
    return result;
}

