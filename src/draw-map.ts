import * as d3 from 'd3';
import * as path from 'path';
import axios from 'axios';

import {RelationRes} from "./data-process";
import {calcCircleLayout, calcCircleLayoutWithoutReduceCrossing} from "./circle-layout";

export async function drawMap(
    svg: HTMLElement,
    data: RelationRes[],
) {
    const canvas = d3.select(svg);
    const defs = canvas.append("defs");
    const arrowMarker = defs.append("marker")
        .attr("id","arrow")
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
        .attr("fill", "#000");
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
    const radius = svg.clientHeight < svg.clientWidth ? svg.clientHeight / 2 : svg.clientWidth / 2;
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
        .attr('id', 'com')
        .selectAll('circle')
        .data(nodes)
        .enter()
        .append('circle')
        .attr('r', d => d.r)
        .attr('cx', d => d.cx)
        .attr('cy', d => d.cy)
        .attr('id', d => d.id)
        .attr('fill', '#B7B7B7');
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
    for (let com of nodes) {
        const tmp = calcCircleLayout(
            {x: com.cx, y: com.cy},
            com.r,
            graph[com.id],
        );
        sequences[com.id] = tmp.sequence;
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
            .attr('fill', '#878787');

        canvas.append('g')
            .attr('id', com.id + 'edges')
            .selectAll('path')
            .data(tmp.edges)
            .enter()
            .append('path')
            .attr('d', d => link(d.path))
            .attr('stroke', '#5A5A5A')
            .attr('stroke-width', 2)
            .attr('fill', 'none')
            .attr('marker-end', 'url(#arrow)');
    }

    // 交互
    for (let com of nodes) {
        const nElement = document.getElementById(com.id + 'nodes');
        d3.select(nElement)
            .selectAll('circle')
            .on('click', (d: any) => {
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
                    .attr('cy', d => d.cy)
                    .attr('id', d => d.id)
                    .attr('fill', '#B7B7B7');
                canvas.select('#com2com')
                    .selectAll('path')
                    .data(edges)
                    .attr('d', d => link(d.path))
                    .attr('stroke', '#878787')
                    .attr('stroke-width', 2)
                    .attr('fill', 'none')
                    .attr('marker-end', 'url(#arrow)');
                for (let com of nodes) {
                    const tmp = calcCircleLayoutWithoutReduceCrossing(
                        {x: com.cx, y: com.cy},
                        com.r,
                        graph[com.id],
                        sequences[com.id],
                        com.id === zoom.com ? d.id : undefined,
                    );
                    const nodeElement = document.getElementById(com.id + 'nodes');
                    // @ts-ignore
                    d3.select(nodeElement)
                        .selectAll('circle')
                        .data(tmp.nodes)
                        .attr('r', d => d.r)
                        .attr('cx', d => d.cx)
                        .attr('cy', d => d.cy)
                        .attr('id', d => d.id)
                        .attr('fill', '#878787');
                    const edgeElement = document.getElementById(com.id + 'edges');
                    // @ts-ignore
                    d3.select(edgeElement)
                        .selectAll('path')
                        .data(tmp.edges)
                        .attr('d', d => link(d.path))
                        .attr('stroke', '#5A5A5A')
                        .attr('stroke-width', 2)
                        .attr('fill', 'none')
                        .attr('marker-end', 'url(#arrow)');
                }
            });
    }
    canvas.select('#com')
        .selectAll('circle')
        .on('click', (d: any) => {
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
                .attr('id', d => d.id)
                .attr('fill', '#B7B7B7');
            canvas.select('#com2com')
                .selectAll('path')
                .data(edges)
                .attr('d', d => link(d.path))
                .attr('stroke', '#878787')
                .attr('stroke-width', 2)
                .attr('fill', 'none')
                .attr('marker-end', 'url(#arrow)');

            for (let com of nodes) {
                const tmp = calcCircleLayoutWithoutReduceCrossing(
                    {x: com.cx, y: com.cy},
                    com.r,
                    graph[com.id],
                    sequences[com.id],
                    undefined
                );
                const nodeElement = document.getElementById(com.id + 'nodes');
                // @ts-ignore
                d3.select(nodeElement)
                    .selectAll('circle')
                    .data(tmp.nodes)
                    .attr('r', d => d.r)
                    .attr('cx', d => d.cx)
                    .attr('cy', d => d.cy)
                    .attr('id', d => d.id)
                    .attr('fill', '#878787');
                const edgeElement = document.getElementById(com.id + 'edges');
                // @ts-ignore
                d3.select(edgeElement)
                    .selectAll('path')
                    .data(tmp.edges)
                    .attr('d', d => link(d.path))
                    .attr('stroke', '#5A5A5A')
                    .attr('stroke-width', 2)
                    .attr('fill', 'none')
                    .attr('marker-end', 'url(#arrow)');
            }
        });
}