import * as d3 from 'd3';
import axios from 'axios';
import { presetPalettes } from '@ant-design/colors';
import { drawTree } from 'facet-tree-visualization';

import {
    calcCircleLayout,
    calcCircleLayoutSecondLayer,
    calcCircleLayoutSecondLayer1,
    calcCircleLayoutWithoutReduceCrossing,
    calcEdgeWithSelectedNode, calcEdgeWithSelectedNodeCrossCom,
    calcEdgeWithSelectedComCrossCom,
    calcLinkSourceTargetBetweenCircles,
    calNodeWithSelectedInComCrossCom,
    calNodeWithSelectedOutComCrossCom,
    calNodeWithSelectedInTopicCrossCom,
    calNodeWithSelecteOutTopicCrossCom
} from "./circle-layout";
import { drawcommunity } from './draw-community';
import { gaozhongshuxue } from '../gaozhongshuxue';

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

export async function drawtopic(
    id:number,//簇的id
    mapData: MapData,//后端返回的数据
    svg: HTMLElement,//画整张图需要的svg
    treeSvg: HTMLElement,//画分面树需要的svg,是通过css设置浮在上面的，其宽高是根据主题个数计算的
    domainName: string, 
    clickTopic,
    clickFacet,
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
    const canvas = d3.select(svg);
    
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
    
    communityRelation = completeObj(communityRelation);
   
    const radius = svg.clientHeight < svg.clientWidth ? svg.clientHeight / 2 - 24 : svg.clientWidth / 2 - 24;
   
    const { nodes, edges, sequence } = calcCircleLayout(
        { x: radius, y: radius },
        radius,
        communityRelation,
        topicId2Community[-1] !== undefined ? topicId2Community[-1] : undefined
    );
    const globalSequence = sequence;
    const sequences = {};
    const zoom = {
        com: undefined,
        topicId: undefined,
    };
    for (let com of nodes) {
        // 计算簇内布局
        const tmp = calcCircleLayout(
            { x: com.cx, y: com.cy },
            com.r,
            graph[com.id],
            com.id === topicId2Community[-1] ? -1 : undefined
        );
        
        sequences[com.id] = tmp.sequence;
    }
    // 根据获取到的id画主题
    comSecond(id);
    const learningPath = [];
    const treesvg = document.getElementById('tree'); 
   
    for (let com of nodes) {
      
        const nElement = document.getElementById(com.id + 'nodes');
        
        d3.select(nElement)
            .selectAll('circle')
            .on('click', (d: any) => clickNode(d, com));
        const tElement = document.getElementById(com.id + 'text');
        d3.select(tElement)
            .selectAll('text')
            .on('click', (d: any) => clickNode(d, com));
    }
    function clickNode(d: any, com) {
        // 一个画分面树的回调函数
        clickTopic(d.id, topics[d.id]);
        // 一个返回输入主题和输出主题
        let InNode =[];
        let OutNode = [];
        InNode = calNodeWithSelectedInTopicCrossCom(
            id,
            d.id,
            graph,
            topics
        );
        OutNode = calNodeWithSelecteOutTopicCrossCom(
            id,
            d.id,
            graph,
            topics
        );
        console.log("InTopic",InNode);
        console.log("OutTopic",OutNode);
    }
    function comSecond(id) {
        const { nodes, edges } = calcCircleLayoutSecondLayer1(
            { x: radius, y: radius },
            radius,
            communityRelation,
            globalSequence,
            id
        );
        // 显示与二级焦点知识簇相关的簇间认知关系
        canvas.select('#com2com')
            .selectAll('path')
            .attr('display', 'none');
        canvas.select('#comText')
            .selectAll('text')
            .attr('display', 'none');
        canvas.select('#com')
            .selectAll('circle')
            .attr('display', 'none');
        console.log("nnnnnodesssss",nodes);
        canvas.select('#com')
            .selectAll('circle')
            .data(nodes)
            .transition()
            .delay(300)
            .attr('r', d => d.r)
            .attr('cx', d => d.cx)
            .attr('cy', d => d.cy)
            .attr('fill', colors[globalSequence.indexOf(id) % colors.length][1])
            .attr('display', 'inline');
        // 保存二级焦点知识簇内节点坐标
        let nodeInCom = {};
        for (let com of nodes) {
            if (com.id !== id) {    
                const nodeElement = document.getElementById(com.id + 'nodes');
                d3.select(nodeElement)
                    .selectAll('circle')
                    .attr('display', 'none');
                const edgeElement = document.getElementById(com.id + 'edges');
                d3.select(edgeElement)
                    .selectAll('path')
                    .attr('display', 'none');
                const textElement = document.getElementById(com.id + 'text');
                d3.select(textElement)
                    .selectAll('text')
                    .attr('display', 'none');
            } else {
                const tmp = calcCircleLayoutWithoutReduceCrossing(
                    { x: com.cx, y: com.cy },
                    com.r,
                    graph[com.id],
                    sequences[com.id],
                    undefined
                );
                for (let node of tmp.nodes) {
                    nodeInCom[node.id] = node;
                }
                console.log("nodeInCom",nodeInCom);
                const nodeElement = document.getElementById(com.id + 'nodes');
                d3.select(nodeElement)
                    .selectAll('circle')
                    .data(tmp.nodes)
                    .transition()
                    .delay(300)
                    .attr('r', d => d.r)
                    .attr('cx', d => d.cx)
                    .attr('cy', d => d.cy)
                    .attr('id', d => d.id)
                    .attr('display', 'inline');
                const edgeElement = document.getElementById(com.id + 'edges');
                d3.select(edgeElement)
                    .selectAll('path')
                    .data(tmp.edges)
                    .transition()
                    .delay(300)
                    .attr('d', d => link(d.path))
                    .attr('stroke-width', 2)
                    .attr('fill', 'none')
                    .attr('display', 'inline');
                const textElement = document.getElementById(com.id + 'text');
                d3.select(textElement)
                    .selectAll('text')
                    .data(tmp.nodes)
                    .transition()
                    .delay(300)
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
                        return d.cx - judgementStringLengthWithChinese(topics[d.id]) * (tmp > 24 ? 12 : tmp / 2);
                    })
                    .attr('y', d => {
                        const tmp = (d.r * 2 - 4) / judgementStringLengthWithChinese(topics[d.id]);
                        if (tmp > 24) {
                            return d.cy + 12;
                        } else {
                            return d.cy + (d.r - 2) / judgementStringLengthWithChinese(topics[d.id]);
                        }
                    })
                    .text(d => topics[d.id])
                    .attr('fill', '#ffffff')
                    .attr('display', 'inline');
            }
        }
        var Incom =[];
        var Outcom = [];
        Incom = calNodeWithSelectedInComCrossCom(
            id,
            communityRelation,
            graph
        )
        Outcom = calNodeWithSelectedOutComCrossCom(
            id,
            communityRelation,
            graph
        )
        console.log("Incom",Incom);
        console.log("Outcom",Outcom); 
        return[Incom,Outcom];
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

