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
            }
        }
    }

}