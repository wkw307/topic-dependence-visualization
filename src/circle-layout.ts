/**
 * 摘除图中的叶子结点
 * @param relations 
 */
function preprocess(relations: {[p:string]: any}): {filteredRelations: {[p:string]:any}; leafRelations: {[p:string]:any}} {
    const nodeFreq = {};
    for (let start in relations) {
        if (relations[start].length !== 0) {
            for (let end of relations[start]) {
                if (nodeFreq[end]) {
                    nodeFreq[end]++;
                } else {
                    nodeFreq[end] = 1;
                }
            }
        }
    }
    const leafNodes = [];
    for (let node in nodeFreq) {
        if (nodeFreq[node] === 1 && relations[node].length === 0) {
            leafNodes.push(parseInt(node))
        }
    }
    const filteredRelations = {};
    const leafRelations = {};
    for (let start in relations) {
        if (relations[start].length !== 0) {
            filteredRelations[start] = [];
            for (let end of relations[start]) {
                if (leafNodes.indexOf(end) === -1) {
                    if (filteredRelations[start]) {
                        filteredRelations[start].push(end);
                    } else {
                        filteredRelations[start] = [end];
                    }
                    if (!filteredRelations.hasOwnProperty(end)) {
                        filteredRelations[end] = [];
                    }
                } else {
                    if (leafRelations[start]) {
                        leafRelations[start].push(end);
                    } else {
                        leafRelations[start] = [end];
                    }
                }
            }
        }
    }
    return {
        filteredRelations,
        leafRelations,
    }
}

/**
 * greedy crossing reduce
 * @param relations 
 */
function reduceCrossing(relations: {[p:string]: any}) {
    const sequence = Array.prototype.concat([], Object.keys(relations).map(x => parseInt(x)));
    const degree = {};
    for (let start in relations) {
        if (relations[start].length !== 0) {
            for (let end of relations[start]) {
                if (degree[start]) {
                    degree[start]++;
                } else {
                    degree[start] = 1;
                }
                if (degree[end]) {
                    degree[end] ++;
                } else {
                    degree[end] = 1;
                }
            }
        }
    }
    let prevCrossing = Infinity;
    let edges = calcCrossing(sequence, relations);
    let maxCrossing = Object.keys(edges).reduce((acc, curr) => acc ? (edges[acc] < edges[curr] ? curr : acc) : curr,'');
    let currCrossing = calcSum(edges);
    let tmpSequence = [...sequence];
    while (currCrossing < prevCrossing && currCrossing > 0) {
        let start, end;
        // 最大交点数为1 单独考虑
        if (edges[maxCrossing] === 1) {
            const crossing1 = [];
            for (let key in edges) {
                if (edges[key] === 1) {
                    crossing1.push(key.split(',').map(x => parseInt(x)));
                }
            }
            let tmp = Infinity;
            let tmpIndex = -1;
            for (let i = 0; i < crossing1.length; i++) {
                for (let id of crossing1[i]) {
                    if (degree[id] < tmp) {
                        tmpIndex = i;
                        tmp = degree[id];
                    }
                }
            }
            [start, end] = crossing1[tmpIndex];
        } else {
            [start, end] = maxCrossing.split(',').map(x => parseInt(x));
        }
        if (degree[start] < degree[end]) {
            sequence.splice(sequence.indexOf(start), 1);
            sequence.splice(sequence.indexOf(end), 0, start);
        } else {
            sequence.splice(sequence.indexOf(end), 1);
            sequence.splice(sequence.indexOf(start), 0, end);
        }
        edges = calcCrossing(sequence, relations);
        maxCrossing = Object.keys(edges).reduce((acc, curr) => acc ? (edges[acc] < edges[curr] ? curr : acc) : curr,'');
        if (currCrossing < calcSum(edges)) break;
        prevCrossing = currCrossing;
        currCrossing = calcSum(edges);
        tmpSequence = [...sequence];
    }
    return tmpSequence;
}

function calcSum(obj: {[p:string]: number}) {
    let result = 0;
    for (let key in obj) {
        result += obj[key];
    }
    return result;
}

/**
 * 计算给定序列下个边的交点数量
 * @param sequence 
 * @param relations 
 */
function calcCrossing(sequence: number[], relations: {[p: string]: any}): {[p:string]:any} {
    const edges = {};
    for (let start in relations) {
        if (relations[start].length !== 0) {
            for (let end of relations[start]) {
                edges[start + ',' + end] = 0;
            }
        }
    }
    for (let edge in edges) {
        const [u1, v1] = edge.split(',').map(x => parseInt(x));
        const u1Index = sequence.indexOf(u1);
        const v1Index = sequence.indexOf(v1);
        const startIndex = u1Index < v1Index ? u1Index : v1Index;
        const endIndex = u1Index < v1Index ? v1Index : u1Index;
        for (let otherEdge of Object.keys(edges)) {
            if (edge !== otherEdge) {
                const [u2, v2] = otherEdge.split(',').map(x => parseInt(x));
                const u2Index = sequence.indexOf(u2);
                const v2Index = sequence.indexOf(v2);
                if (
                    (whetherInRange(startIndex, endIndex, u2Index) && whetherOutRange(startIndex, endIndex, v2Index))
                    || (whetherOutRange(startIndex, endIndex, u2Index) && whetherInRange(startIndex, endIndex, v2Index))
                ) {
                    edges[edge]++;
                }
            }
        }
    }
    return edges;
}

/**
 * 计算两个圆圆心连线在两个圆上的交点
 * return { source: [x,y], target: [x,y] }
 */
function calcLinkSourceTargetBetweenCircles(cx1, cy1, r1, cx2, cy2, r2){
    let x1 = cx1 + r1 * (cx2 - cx1) / Math.sqrt((cx1 - cx2) * (cx1 - cx2) + (cy1 - cy2) * (cy1 - cy2));
    let y1 = cy1 + r1 * (cy2 - cy1) / Math.sqrt((cx1 - cx2) * (cx1 - cx2) + (cy1 - cy2) * (cy1 - cy2));
    let x2 = cx2 - r2 * (cx2 - cx1) / Math.sqrt((cx1 - cx2) * (cx1 - cx2) + (cy1 - cy2) * (cy1 - cy2));
    let y2 = cy2 - r2 * (cy2 - cy1) / Math.sqrt((cx1 - cx2) * (cx1 - cx2) + (cy1 - cy2) * (cy1 - cy2));
    return [{'x': x1, 'y': y1}, {'x': x2, 'y': y2}];
}

/**
 * 判断给定值是否在某个范围内
 * @param start 
 * @param end 
 * @param target 
 */
function whetherInRange(start, end, target): boolean {
    return target < end && target > start;
}

function whetherOutRange(start, end, target): boolean {
    return target > end || target < start;
}

export function calcCircleLayout(
    center: {x: number; y: number;},
    radius: number,
    relations: {[p: string]: any},
    ) {
    const {filteredRelations, leafRelations} = preprocess(relations);
    let sequence = reduceCrossing(filteredRelations);
    for (let start in leafRelations) {
        for (let end of leafRelations[start]) {
            sequence.splice(sequence.indexOf(parseInt(start))+1, 0, end)
        }
    }
    const degree = {};
    for (let start in relations) {
        if (relations[start].length !== 0) {
            for (let end of relations[start]) {
                if (degree[start]) {
                    degree[start]++;
                } else {
                    degree[start] = 1;
                }
                if (degree[end]) {
                    degree[end] ++;
                } else {
                    degree[end] = 1;
                }
            }
        }
    }
    // 将入度为0 出度最大的点放在第一个
    const inDegree0 = [];
    for (let start in relations) {
        let flag = true;
        for (let other in relations) {
            if (other !== start) {
                for (let end of relations[other]) {
                    if (parseInt(start) === end) {
                        flag = false;
                    }
                }
            }
        }
        if (flag) {
            inDegree0.push(parseInt(start));
        }
    }
    if (inDegree0.length > 0) {
        const initNode = inDegree0.reduce((acc, curr) => acc ? (degree[acc] > degree[curr] ? acc : curr) : curr);
        const initIndex = sequence.indexOf(initNode);
        sequence = sequence.slice(initIndex).concat(sequence.slice(0, initIndex));
    }
    return Object.assign({
        sequence
        },
        calcCircleLayoutWithoutReduceCrossing(
            center,
            radius,
            relations,
            sequence,
            undefined
        ));
}

export function calcCircleLayoutWithoutReduceCrossing(
    center: {x: number; y: number;},
    radius: number,
    relations: {[p: string]: any},
    sequence: number[],
    focus: number | undefined
): {nodes: any[], edges: any[]} {
   if (focus === undefined) {
       const count = sequence.length;
       const r = 0.8 * radius * Math.sin(Math.PI / count) / (1 + Math.sin(Math.PI / count));
       const angle = Math.PI * 2 / count;
       const nodes = [];
       const edges = [];
       const node2position = {};
       for (let i = 0; i < count; i++) {
           const tmp = {
               r,
               id: sequence[i],
               cx: center.x + (radius - r) * Math.sin(angle * i),
               cy: center.y - (radius - r) * Math.cos(angle * i),
           };
           node2position[sequence[i]] = [tmp.cx, tmp.cy, r];
           nodes.push(tmp);
       }
       for (let start in relations) {
           if (relations[start].length !== 0) {
               for (let end of relations[start]) {
                   const tmp = {
                       start: parseInt(start),
                       end: parseInt(end),
                       path: calcLinkSourceTargetBetweenCircles(
                           node2position[start][0],
                           node2position[start][1],
                           node2position[start][2],
                           node2position[end][0],
                           node2position[end][1],
                           node2position[end][2]),
                   };
                   edges.push(tmp);
               }
           }
       }
       return {
           nodes,
           edges,
       }
   } else {
       const count = sequence.length;
       const r = 0.8 * radius * Math.sin(Math.PI / (count + 1)) / (1 + Math.sin(Math.PI / (count + 1)));
       const R = 1.6 * radius * Math.sin(Math.PI / (count + 1)) / (1 + Math.sin(Math.PI / (count + 1)));
       const angle = Math.PI * 2 / (count + 1);
       const nodes = [];
       const edges = [];
       const node2position = {};
       for (let i = 0; i < count; i++) {
           if (sequence.indexOf(focus) > i) {
               const tmp = {
                   r,
                   id: sequence[i],
                   cx: center.x + (radius - r) * Math.sin(angle * i),
                   cy: center.y - (radius - r) * Math.cos(angle * i),
               };
               node2position[sequence[i]] = [tmp.cx, tmp.cy, r];
               nodes.push(tmp);
           } else if (sequence.indexOf(focus) === i) {
               const tmp = {
                   r: R,
                   id: sequence[i],
                   cx: center.x + (radius - R) * Math.sin(angle * i + angle / 2),
                   cy: center.y - (radius - R) * Math.cos(angle * i + angle / 2),
               };
               node2position[sequence[i]] = [tmp.cx, tmp.cy, R];
               nodes.push(tmp);
           } else {
               const tmp = {
                   r,
                   id: sequence[i],
                   cx: center.x + (radius - r) * Math.sin(angle * i + angle),
                   cy: center.y - (radius - r) * Math.cos(angle * i + angle),
               };
               node2position[sequence[i]] = [tmp.cx, tmp.cy, r];
               nodes.push(tmp);
           }

       }
       for (let start in relations) {
           if (relations[start].length !== 0) {
               for (let end of relations[start]) {
                   const tmp = {
                       start: parseInt(start),
                       end: parseInt(end),
                       path: calcLinkSourceTargetBetweenCircles(
                           node2position[start][0],
                           node2position[start][1],
                           node2position[start][2],
                           node2position[end][0],
                           node2position[end][1],
                           node2position[end][2]),
                   };
                   edges.push(tmp);
               }
           }
       }
       return {
           nodes,
           edges,
       }
   }
}

export function calcCircleLayoutSecondLayer(
    center: {x: number; y: number},
    radius: number,
    relations: {[p:string]:any},
    sequence: number[],
    focus: number,
) {
    const count = sequence.length;
    const r = 0.4 * radius * Math.sin(Math.PI / (count + 1)) / (1 + Math.sin(Math.PI / (count + 1)));
    const angle = Math.PI * 2 / (count + 1);
    const nodes = [];
    const edges = [];
    const node2position = {};
    for (let i = 0; i < count; i++) {
        if (sequence.indexOf(focus) > i) {
            const tmp = {
                r,
                id: sequence[i],
                cx: center.x + (radius - r) * Math.sin(angle * i),
                cy: center.y - (radius - r) * Math.cos(angle * i),
            };
            node2position[sequence[i]] = [tmp.cx, tmp.cy, r];
            nodes.push(tmp);
        } else if (sequence.indexOf(focus) === i) {
            const tmp = {
                r: 0.9 * ( radius - 2 * r ),
                id: sequence[i],
                cx: center.x,
                cy: center.y,
            };
            node2position[sequence[i]] = [tmp.cx, tmp.cy, tmp.r];
            nodes.push(tmp);
        } else {
            const tmp = {
                r,
                id: sequence[i],
                cx: center.x + (radius - r) * Math.sin(angle * i + angle),
                cy: center.y - (radius - r) * Math.cos(angle * i + angle),
            };
            node2position[sequence[i]] = [tmp.cx, tmp.cy, r];
            nodes.push(tmp);
        }

    }
    return {
        nodes,
        edges,
    }
}