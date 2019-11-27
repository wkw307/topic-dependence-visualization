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
    let currCrossing = edges[maxCrossing];
    let tmpSequence = [...sequence];
    while (currCrossing < prevCrossing) {
        const [start, end] = maxCrossing.split(',').map(x => parseInt(x));
        if (degree[start] > degree[end]) {
            sequence.splice(sequence.indexOf(start), 1);
            sequence.splice(sequence.indexOf(end), 0, start);
        } else {
            sequence.splice(sequence.indexOf(end), 1);
            sequence.splice(sequence.indexOf(start), 0, end);
        }
        edges = calcCrossing(sequence, relations);
        maxCrossing = Object.keys(edges).reduce((acc, curr) => acc ? (edges[acc] < edges[curr] ? curr : acc) : curr,'');
        if (currCrossing < edges[maxCrossing]) break;
        prevCrossing = currCrossing;
        currCrossing = edges[maxCrossing];
        tmpSequence = [...sequence];
    }
    return tmpSequence;
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
                    (whetherInRange(startIndex, endIndex, u2Index) && !whetherInRange(startIndex, endIndex, v2Index))
                    || (!whetherInRange(startIndex, endIndex, u2Index) && whetherInRange(startIndex, endIndex, v2Index))
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

export function calcCircleLayout(
    center: {x: number; y: number;},
    radius: number,
    relations: {[p: string]: any},
    ) {
    const {filteredRelations, leafRelations} = preprocess(relations);
    const sequence = reduceCrossing(filteredRelations);
    for (let start in leafRelations) {
        for (let end of leafRelations[start]) {
            sequence.splice(sequence.indexOf(parseInt(start))+1, 0, end)
        }
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
       const r = 0.7 * radius * Math.sin(Math.PI / count) / (1 + Math.sin(Math.PI / count));
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
       const r = 0.7 * radius * Math.sin(Math.PI / (count + 1)) / (1 + Math.sin(Math.PI / (count + 1)));
       const R = 1.4 * radius * Math.sin(Math.PI / (count + 1)) / (1 + Math.sin(Math.PI / (count + 1)));
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