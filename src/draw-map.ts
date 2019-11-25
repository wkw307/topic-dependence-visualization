import * as d3 from 'd3';
import * as path from 'path';
import axios from 'axios';

import {RelationRes} from "./data-process";
import {calcCircleLayout} from "./circle-layout";

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
    const {nodes, edges} = calcCircleLayout(
        {x: radius, y: radius},
        radius,
        communityRelation);
    canvas.append('g')
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
        canvas.append('g')
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
}