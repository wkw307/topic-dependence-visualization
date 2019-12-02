import * as d3 from 'd3';
import * as path from 'path';
import axios from 'axios';
import {presetPalettes} from '@ant-design/colors';

import {RelationRes} from "./data-process";
import {calcCircleLayout, calcCircleLayoutWithoutReduceCrossing} from "./circle-layout";

const colors = [];
for (let key in presetPalettes) {
    colors.push(presetPalettes[key].slice(0, 10));
}

export async function drawMap(
    svg: HTMLElement,
    data: RelationRes[],
    clickTopic
) {
    const canvas = d3.select(svg);
    const defs = canvas.append("defs");
    const arrow = defs.append("marker")
        .attr("id","arrow")
        .attr("markerUnits","strokeWidth")
        .attr("markerWidth","8")
        .attr("markerHeight","8")
        .attr("viewBox","0 0 12 12")
        .attr("refX","6")
        .attr("refY","6")
        .attr("orient","auto");
    const arrow_path = "M2,2 L10,6 L2,10 L6,6 L2,2";
    arrow.append("path")
        .attr("d",arrow_path)
        .attr("fill", '#000000');
    for (let i = 0; i < colors.length; i++) {
        const arrowMarker = defs.append("marker")
            .attr("id","arrow" + i)
            .attr("markerUnits","strokeWidth")
            .attr("markerWidth","8")
            .attr("markerHeight","8")
            .attr("viewBox","0 0 12 12")
            .attr("refX","6")
            .attr("refY","6")
            .attr("orient","auto");
        const arrow_path = "M2,2 L10,6 L2,10 L6,6 L2,2";
        arrowMarker.append("path")
            .attr("d",arrow_path)
            .attr("fill", colors[i][9]);
    }
    const link = d3.line()
    // @ts-ignore
        .x(function(d){return d.x})
        // @ts-ignore
        .y(function(d){return d.y})
        .curve(d3.curveCatmullRom.alpha(0.5));

    const parseResult = await axios.post('http://localhost:3000/parseAPI', data, {
        headers: {
            'Content-Type': 'application/json'
        },
    });
    const {topics, relations} = parseResult.data;
    const resultRelations = (await axios.post('http://localhost:3000/preProcess', {
        topics, relations
    }, {
        headers: {
            'Content-Type': 'application/json'
        },
    })).data;
    if (resultRelations.hasOwnProperty(-1)) {
        topics[-1] = '（开始）';
    }
    const {graph, topicId2Community, communityRelation, relationCrossCommunity} = (await axios.post('http://localhost:3000/calCommunity', {
        rpath: '../rscript/communityDiscovery.r',
        topics,
        relations: resultRelations,
        output: '../tmp/',
    }, {
        headers: {
            'Content-Type': 'application/json'
        },
    })).data;

    const radius = svg.clientHeight < svg.clientWidth ? svg.clientHeight / 2 - 24 : svg.clientWidth / 2 - 24;
    const {nodes, edges, sequence} = calcCircleLayout(
        {x: radius, y: radius},
        radius,
        communityRelation);
    const globalSequence = sequence;
    const sequences = {};
    const zoom = {
        com: undefined,
        topicId: undefined,
    };
    canvas.append('g')
        .attr('id', 'com2com')
        .selectAll('path')
        .data(edges)
        .enter()
        .append('path')
        .attr('d', d => link(d.path))
        .attr('stroke', '#878787')
        .attr('stroke-width', 2)
        .attr('fill', 'none')
        .attr('marker-end', 'url(#arrow)');
    canvas.append('g')
        .attr('id', 'com')
        .selectAll('circle')
        .data(nodes)
        .enter()
        .append('circle')
        .attr('r', d => d.r)
        .attr('cx', d => d.cx)
        .attr('cy', d => d.cy)
        .attr('id', d => d.id)
        .attr('fill', (d, i) => colors[i][1]);
    for (let com of nodes) {
        const tmp = calcCircleLayout(
            {x: com.cx, y: com.cy},
            com.r,
            graph[com.id],
        );
        sequences[com.id] = tmp.sequence;
        canvas.append('g')
            .attr('id', com.id + 'edges')
            .selectAll('path')
            .data(tmp.edges)
            .enter()
            .append('path')
            .attr('d', d => link(d.path))
            .attr('stroke', colors[globalSequence.indexOf(com.id)][8])
            .attr('stroke-width', 2)
            .attr('fill', 'none')
            .attr('marker-end', 'url(#arrow' + globalSequence.indexOf(com.id) + ')');
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
            .attr('fill', colors[globalSequence.indexOf(com.id)][6]);
        canvas.append('g')
            .attr('id', com.id + 'text')
            .selectAll('text')
            .data(tmp.nodes)
            .enter()
            .append('text')
            .attr('font-size', d => (d.r * 2 - 4) / topics[d.id].length)
            .attr('x', d => d.cx - d.r + 2)
            .attr('y', d => d.cy + (d.r - 2) / topics[d.id].length)
            .text(d => topics[d.id])
            .attr('fill', '#ffffff')
            .attr('cursor', 'pointer');
    }
    canvas.append('g')
        .attr('id', 'comText')
        .selectAll('text')
        .data(nodes)
        .enter()
        .append('text')
        .attr('font-size', 14)
        .attr('x', d => d.cx - 14 * topics[sequences[d.id][0]].length / 2)
        .attr('y', d => d.cy + d.r + 24)
        .text(d => topics[sequences[d.id][0]])
        .attr('fill', '#000000')
        .attr('cursor', 'pointer');
    // 交互
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
    canvas.select('#com')
        .selectAll('circle')
        .on('click', d => clickCom(d));
    canvas.select('#comText')
        .selectAll('text')
        .on('click', d => clickCom(d));

    function clickCom(d: any) {
        zoom.com = d.id;
        const {nodes, edges} = calcCircleLayoutWithoutReduceCrossing(
            {x: radius, y: radius},
            radius,
            communityRelation,
            globalSequence,
            d.id
        );
        canvas.select('#com')
            .selectAll('circle')
            .data(nodes)
            .attr('r', d => d.r)
            .attr('cx', d => d.cx)
            .attr('cy', d => d.cy)
            .attr('id', d => d.id);
        canvas.select('#com2com')
            .selectAll('path')
            .data(edges)
            .attr('d', d => link(d.path))
            .attr('stroke-width', 2)
            .attr('fill', 'none');
        canvas.select('#comText')
            .selectAll('text')
            .data(nodes)
            .attr('x', d => d.cx - 14 * topics[sequences[d.id][0]].length / 2)
            .attr('y', d => d.cy + d.r + 24);
        for (let com of nodes) {
            const tmp = calcCircleLayoutWithoutReduceCrossing(
                {x: com.cx, y: com.cy},
                com.r,
                graph[com.id],
                sequences[com.id],
                undefined
            );
            const nodeElement = document.getElementById(com.id + 'nodes');
            d3.select(nodeElement)
                .selectAll('circle')
                .data(tmp.nodes)
                .attr('r', d => d.r)
                .attr('cx', d => d.cx)
                .attr('cy', d => d.cy)
                .attr('id', d => d.id);
            const edgeElement = document.getElementById(com.id + 'edges');
            d3.select(edgeElement)
                .selectAll('path')
                .data(tmp.edges)
                .attr('d', d => link(d.path))
                .attr('stroke-width', 2)
                .attr('fill', 'none');
            const textElement = document.getElementById(com.id + 'text');
            d3.select(textElement)
                .selectAll('text')
                .data(tmp.nodes)
                .attr('font-size', d => (d.r * 2 - 4) / topics[d.id].length)
                .attr('x', d => d.cx - d.r + 2)
                .attr('y', d => d.cy + (d.r - 2) / topics[d.id].length)
                .text(d => topics[d.id])
                .attr('fill', '#ffffff');
        }
    }

    function clickNode(d: any, com) {
        zoom.topicId = d.id;
        zoom.com = com.id;
        const {nodes, edges} = calcCircleLayoutWithoutReduceCrossing(
            {x: radius, y: radius},
            radius,
            communityRelation,
            globalSequence,
            com.id
        );
        canvas.select('#com')
            .selectAll('circle')
            .data(nodes)
            .attr('r', d => d.r)
            .attr('cx', d => d.cx)
            .attr('cy', d => d.cy);
        canvas.select('#com2com')
            .selectAll('path')
            .data(edges)
            .attr('d', d => link(d.path))
            .attr('stroke', '#878787')
            .attr('stroke-width', 2)
            .attr('fill', 'none');
        canvas.select('#comText')
            .selectAll('text')
            .data(nodes)
            .attr('x', d => d.cx - 14 * topics[sequences[d.id][0]].length / 2)
            .attr('y', d => d.cy + d.r + 24);
        for (let com of nodes) {
            const tmp = calcCircleLayoutWithoutReduceCrossing(
                {x: com.cx, y: com.cy},
                com.r,
                graph[com.id],
                sequences[com.id],
                com.id === zoom.com ? d.id : undefined,
            );
            const nodeElement = document.getElementById(com.id + 'nodes');
            d3.select(nodeElement)
                .selectAll('circle')
                .data(tmp.nodes)
                .attr('r', d => d.r)
                .attr('cx', d => d.cx)
                .attr('cy', d => d.cy);
            const edgeElement = document.getElementById(com.id + 'edges');
            d3.select(edgeElement)
                .selectAll('path')
                .data(tmp.edges)
                .attr('d', d => link(d.path))
                .attr('stroke-width', 2)
                .attr('fill', 'none');
            const textElement = document.getElementById(com.id + 'text');
            d3.select(textElement)
                .selectAll('text')
                .data(tmp.nodes)
                .attr('font-size', d => (d.r * 2 - 4) / topics[d.id].length)
                .attr('x', d => d.cx - d.r + 2)
                .attr('y', d => d.cy + (d.r - 2) / topics[d.id].length)
                .text(d => topics[d.id])
                .attr('fill', '#ffffff');
        }
        clickTopic(d.id, topics[d.id]);
    }
}

