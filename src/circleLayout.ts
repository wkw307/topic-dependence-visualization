/**
 * 摘除图中的叶子结点
 * @param relations 
 */
function preprocess(relations: {[p:string]: any}): {filteredRealtions: {[p:string]:any}; leafRelations: {[p:string]:any}} {
    const nodeFreq = {};
    for (let start in relations) {
        if (relations[start]) {
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
        if (nodeFreq[node] === 1) {
            leafNodes.push(parseInt(node))
        }
    }
    const filteredRealtions = {};
    const leafRelations = {};
    for (let start in relations) {
        filteredRealtions[start] = undefined;
        if (relations[start]) {
            for (let end of relations[start]) {
                if (leafNodes.indexOf(end) === -1) {
                    if (filteredRealtions[start]) {
                        filteredRealtions[start].push(end);
                    } else {
                        filteredRealtions[start] = [end];
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
        filteredRealtions,
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
        if (relations[start]) {
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
    while (currCrossing < prevCrossing) {
        const [start, end] = maxCrossing.split(',').map(x => parseInt(x));
        if (degree[start] > degree[end]) {
            sequence.splice(sequence.indexOf(start), 1);
            sequence.splice(sequence.indexOf(end), 0, start);
        } else {
            sequence.splice(sequence.indexOf(end), 1);
            sequence.splice(sequence.indexOf(start), 0, start);
        }
        edges = calcCrossing(sequence, relations);
        maxCrossing = Object.keys(edges).reduce((acc, curr) => acc ? (edges[acc] < edges[curr] ? curr : acc) : curr,'');
        prevCrossing = currCrossing;
        currCrossing = edges[maxCrossing];
    }
    return sequence;
}

/**
 * 计算给定序列下个边的交点数量
 * @param sequence 
 * @param relations 
 */
function calcCrossing(sequence: number[], relations: {[p: string]: any}): {[p:string]:any} {
    const edges = {};
    for (let start in relations) {
        if (relations[start]) {
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
 * 判断给定值是否在某个范围内
 * @param start 
 * @param end 
 * @param target 
 */
function whetherInRange(start, end, target): boolean {
    if (target < end && target > start) {
        return true;
    } else {
        return false;
    }
}

export function calcCircleLayout(
    center: {x: number; y: number;},
    radius: number,
    relations: {[p: string]: any},
    ): void {
    const nodes = [];
    for (let start in relations) {
        if (relations[start]) {
            for (let end of relations[start]) {
                if (nodes.indexOf(end) === -1) {
                    nodes.push(end);
                }
                if (!relations.hasOwnProperty(end)) {
                    relations[end] = undefined;
                }
            }
        }
    }
    const {filteredRealtions, leafRelations} = preprocess(relations);
    const sequence = reduceCrossing(filteredRealtions);
    for (let start in leafRelations) {
        for (let end of leafRelations[start]) {
            sequence.splice(sequence.indexOf(start), 0, end)
        }
    }
    
}