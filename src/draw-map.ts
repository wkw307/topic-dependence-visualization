import * as d3 from 'd3';
import * as path from 'path';
import axios from 'axios';
import {presetPalettes} from '@ant-design/colors';
import {drawTree} from '../module/facetTree';

import {RelationRes} from "./data-process";
import {
    calcCircleLayout,
    calcCircleLayoutSecondLayer,
    calcCircleLayoutWithoutReduceCrossing,
    calcEdgeWithSelectedNode, calcEdgeWithSelectedNodeCrossCom
} from "./circle-layout";

const colors = [];
for (let key in presetPalettes) {
    colors.push(presetPalettes[key].slice(0, 10));
}

export async function drawMap(
    svg: HTMLElement,
    treeSvg: HTMLElement,
    data: RelationRes[],
    clickTopic
) {
    let layer = 0;
    const canvas = d3.select(svg);
    const divTooltip = d3.select('body').append('div')
        .style('position', 'absolute')
        .style('opacity', 0)
        .style('text-align', 'center')
        .style('font-size', '6px')
        .style('background-color', '#ffffb8')
        .style('padding', '1px 3px');
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
        .attr("fill", '#873800');
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
        .attr('stroke', '#873800')
        .attr('stroke-width', 4)
        .attr('fill', 'none')
        .style('cursor', 'pointer')
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
        .on("mouseout", function(d) {
            divTooltip.transition()
                .duration(500)
                .style("opacity", 0);
        })
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
            .attr('cursor', 'pointer');
    }
    canvas.append('g')
        .attr('id', 'comText')
        .selectAll('text')
        .data(nodes)
        .enter()
        .append('text')
        .attr('font-size', 14)
        .attr('x', d => d.cx - 14 * judgementStringLengthWithChinese(topics[sequences[d.id][0]]) / 2)
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
        d3.select('#edgeWithTopicInCom').remove();
        d3.select('#edgeWithTopicCrossCom').remove();
        treeSvg.style.visibility = 'hidden';
        switch (layer) {
            case 0:
                comFirst(d.id);
                layer = 1;
                break;
            case 1:
                if (zoom.com === d.id) {
                    layer = 2;
                    comSecond(d.id);
                } else {
                    comFirst(d.id);
                }
                break;
            case 2:
                comFirst(d.id);
                layer = 1;
                break;
            case 3:
                if (zoom.com === d.id) {
                    comSecond(d.id);
                    layer = 2;
                } else {
                    comFirst(d.id);
                    layer = 1;
                }
                break;
        }
        zoom.com = d.id;
    }

    /**
     * 知识簇第一种形态
     * id: 选中知识簇id
     */
    function comFirst(id) {
        const {nodes, edges} = calcCircleLayoutWithoutReduceCrossing(
            {x: radius, y: radius},
            radius,
            communityRelation,
            globalSequence,
            id
        );
        canvas.select('#com')
            .selectAll('circle')
            .data(nodes)
            .transition()
            .delay(300)
            .attr('r', d => d.r)
            .attr('cx', d => d.cx)
            .attr('cy', d => d.cy)
            .attr('id', d => d.id)
            .attr('display', 'inline');
        canvas.select('#com2com')
            .selectAll('path')
            .data(edges)
            .transition()
            .delay(300)
            .attr('d', d => link(d.path))
            .attr('display', 'inline');
        canvas.select('#comText')
            .selectAll('text')
            .data(nodes)
            .transition()
            .delay(300)
            .attr('x', d => d.cx - 14 * judgementStringLengthWithChinese(topics[sequences[d.id][0]]) / 2)
            .attr('y', d => d.cy + d.r + 24)
            .attr('font-size', 14)
            .attr('display', 'inline');
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
                    return d.cx - judgementStringLengthWithChinese(topics[d.id]) * (tmp > 24 ? 12 : tmp/2);
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

    /**
     * 知识簇第二种形态
     * @param id
     */
    function comSecond(id) {
        const {nodes, edges} = calcCircleLayoutSecondLayer(
            {x: radius, y: radius},
            radius,
            communityRelation,
            globalSequence,
            id
        );
        canvas.select('#com')
            .selectAll('circle')
            .data(nodes)
            .transition()
            .delay(300)
            .attr('r', d => d.r)
            .attr('cx', d => d.cx)
            .attr('cy', d => d.cy)
            .attr('id', d => d.id);
        canvas.select('#com2com')
            .selectAll('path')
            .attr('display', 'none');
        canvas.select('#comText')
            .selectAll('text')
            .data(nodes)
            .transition()
            .delay(300)
            .attr('x', d => {
                const tmp = (d.r * 2 - 4) / judgementStringLengthWithChinese(topics[sequences[d.id][0]]);
                return d.cx - judgementStringLengthWithChinese(topics[sequences[d.id][0]]) * (tmp > 24 ? 12 : tmp / 2);
            })
            .attr('y', d => {
                const tmp = (d.r * 2 - 4) / judgementStringLengthWithChinese(topics[sequences[d.id][0]]);
                if (tmp > 24) {
                    return d.cy + 12;
                }
                return d.cy + (d.r - 2) / judgementStringLengthWithChinese(topics[sequences[d.id][0]]);
            })
            .attr('font-size', d => {
                if (d.id === id) {
                    return 0;
                } else {
                    const tmp = (d.r * 2 - 4) / judgementStringLengthWithChinese(topics[sequences[d.id][0]]);
                    if (tmp > 24) {
                        return 24;
                    }
                    return tmp;
                }
            });
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
                        return d.cx - judgementStringLengthWithChinese(topics[d.id]) * (tmp > 24 ? 12 : tmp/2);
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
    }

    function clickNode(d: any, com) {
        d3.select('#edgeWithTopicInCom').remove();
        d3.select('#edgeWithTopicCrossCom').remove();
        treeSvg.style.visibility = 'hidden';
        zoom.topicId = d.id;
        zoom.com = com.id;
        if (d.id === -1) {
            comSecond(com.id);
            layer = 2;
            return;
        }
        switch (layer) {
            case 0:
                comSecond(com.id);
                layer = 2;
                break;
            case 1:
                comSecond(com.id);
                layer = 2;
                break;
            case 2:
                nodeFirst(d.id, com);
                layer = 3;
                break;
            case 3:
                nodeFirst(d.id, com);
                break;
        }
        clickTopic(d.id, topics[d.id]);
    }

    /**
     * 知识主题第一种形态
     * @param id
     * @param com
     */
    function nodeFirst(id, c) {
        const {nodes, edges} = calcCircleLayoutSecondLayer(
            {x: radius, y: radius},
            radius,
            communityRelation,
            globalSequence,
            c.id
        );
        canvas.select('#com')
            .selectAll('circle')
            .data(nodes)
            .transition()
            .delay(300)
            .attr('r', d => d.r)
            .attr('cx', d => d.cx)
            .attr('cy', d => d.cy)
            .attr('id', d => d.id);
        canvas.select('#com2com')
            .selectAll('path')
            .attr('display', 'none');
        canvas.select('#comText')
            .selectAll('text')
            .data(nodes)
            .transition()
            .delay(300)
            .attr('x', d => {
                const tmp = (d.r * 2 - 4) / judgementStringLengthWithChinese(topics[sequences[d.id][0]]);
                return d.cx - judgementStringLengthWithChinese(topics[sequences[d.id][0]]) * (tmp > 24 ? 12 : tmp / 2);
            })
            .attr('y', d => {
                const tmp = (d.r * 2 - 4) / judgementStringLengthWithChinese(topics[sequences[d.id][0]]);
                if (tmp > 24) {
                    return d.cy + 12;
                } else {
                    return d.cy + (d.r - 2) / judgementStringLengthWithChinese(topics[sequences[d.id][0]]);
                }
            })
            .attr('font-size', d => {
                if (d.id === c.id) {
                    return 0;
                } else {
                    const tmp = (d.r * 2 - 4) / judgementStringLengthWithChinese(topics[sequences[d.id][0]]);
                    if (tmp > 24) {
                        return 24;
                    } else {
                        return tmp;
                    }
                }
            });
        for (let com of nodes) {
            if (com.id !== c.id) {
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
                const tmp = calcCircleLayoutSecondLayer(
                    {x: com.cx, y: com.cy},
                    com.r,
                    graph[com.id],
                    sequences[com.id],
                    id
                );
                const nodeElement = document.getElementById(com.id + 'nodes');
                d3.select(nodeElement)
                    .selectAll('circle')
                    .data(tmp.nodes)
                    .attr('r', d => d.r)
                    .attr('cx', d => d.cx)
                    .attr('cy', d => d.cy)
                    .attr('id', d => d.id)
                    .attr('display', d => d.id === id ? 'none' : 'inline');
                const edgeElement = document.getElementById(com.id + 'edges');
                d3.select(edgeElement)
                    .selectAll('path')
                    .attr('display', 'none');
                const textElement = document.getElementById(com.id + 'text');
                d3.select(textElement)
                    .selectAll('text')
                    .data(tmp.nodes)
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
                    .attr('display', d => d.id === id ? 'none' : 'inline');

                const count = sequences[com.id].length;
                const r = 0.4 * com.r * Math.sin(Math.PI / (count + 1)) / (1 + Math.sin(Math.PI / (count + 1)));
                treeSvg.style.width = ( 2 * com.r - 4 * r ) / 5 * 3 + 'px';
                treeSvg.style.height = ( 2 * com.r - 4 * r ) / 5 * 4 + 'px';
                treeSvg.style.left = ( svg.clientWidth / 2 - ( com.r - 2 * r ) / 5 * 3 - 24) + 'px';
                treeSvg.style.top = ( svg.clientHeight / 2 - ( com.r - 2 * r ) / 5 * 4 - 24) + 'px';
                treeSvg.style.visibility = 'visible';
                if (id !== -1 && topics[id]) {
                    axios.post('http://yotta.xjtushilei.com:8083/topic/getCompleteTopicByTopicName?topicName=' + encodeURIComponent(topics[id]) + '&hasFragment=emptyAssembleContent').then(res => {
                        drawTree(treeSvg, res.data.data, () => {});
                    }).catch(err => console.log(err))
                }
                const es = calcEdgeWithSelectedNode(
                    {x: com.cx, y: com.cy},
                    com.r,
                    graph[com.id],
                    tmp.nodes,
                    id,
                );
                canvas.append('g')
                    .attr('id', 'edgeWithTopicInCom')
                    .selectAll('path')
                    .data(es)
                    .enter()
                    .append('path')
                    .attr('d', d => link(d))
                    .attr('stroke', '#873800')
                    .attr('stroke-width', 2)
                    .attr('fill', 'none')
                    .attr('marker-end', 'url(#arrow)');
                const edgeCrossCom = calcEdgeWithSelectedNodeCrossCom(
                    {x: com.cx, y: com.cy},
                    com.r,
                    id,
                    relationCrossCommunity,
                    topicId2Community,
                    nodes
                );
                canvas.append('g')
                    .attr('id', 'edgeWithTopicCrossCom')
                    .selectAll('path')
                    .data(edgeCrossCom)
                    .enter()
                    .append('path')
                    .attr('d', d => link(d.path))
                    .attr('stroke', '#873800')
                    .attr('stroke-width', 4)
                    .attr('fill', 'none')
                    .style('cursor', 'pointer')
                    .on('mouseover', d => {
                        let topic = '';
                        for (let topicId of d.topics) {
                            topic += topics[topicId] + ' ';
                        }
                        divTooltip.transition()
                            .duration(200)
                            .style("opacity", .9);
                        divTooltip.html(topic.trim())
                            .style("left", (d3.event.pageX) + "px")
                            .style("top", (d3.event.pageY - 28) + "px");
                    })
                    .on("mouseout", function(d) {
                        divTooltip.transition()
                            .duration(500)
                            .style("opacity", 0);
                    })
                    .on('click', d => {
                        divTooltip.transition()
                            .duration(500)
                            .style("opacity", 0);

                        if (com.id === d.start) {
                            zoom.com = d.end;
                            clickCom({id:d.end});
                        } else {
                            zoom.com = d.start;
                            clickCom({id:d.start});
                        }
                    })
                    .attr('marker-end', 'url(#arrow)');

            }
        }

    }

    function clickRelation() {

    }

    function clickCanvas() {

    }
}

function judgementStringLengthWithChinese(str: string): number {
    let result = 0;
    for (let i = 0; i < str.length; i++) {
        if (/[a-z0-9\+\-\*\\\|\(\)\&\^\%\$\#\@\!\,\.\?\<\>\/]/.test(str[i])) {
            result += 0.5;
        } else {
            result += 1;
        }
    }
    return result;
}
