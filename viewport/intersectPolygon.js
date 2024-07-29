export function intersect(subjectPolygon, clipPolygon) {
    let outputList = subjectPolygon;

    // Function to check if a point is inside a clip edge
    const inside = (p, edge) => {
        const a = edge[0], b = edge[1];
        return (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x) > 0;
    };

    // Function to compute the intersection point
    const computeIntersection = (start, end, edge) => {
        const a = edge[0], b = edge[1];
        const x1 = start.x, y1 = start.y, x2 = end.x, y2 = end.y;
        const x3 = a.x, y3 = a.y, x4 = b.x, y4 = b.y;
        const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
        const px = ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) / den;
        const py = ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) / den;
        return {x: px, y: py};
    };

    // Iterate over the clip polygon edges
    clipPolygon.forEach((_, i) => {
        const clipEdge = [clipPolygon[i], clipPolygon[(i + 1) % clipPolygon.length]];
        let inputList = outputList;
        outputList = [];
        let S = inputList[inputList.length - 1]; // Last vertex of input list

        inputList.forEach((E) => {
            if (inside(E, clipEdge)) {
                if (!inside(S, clipEdge)) {
                    outputList.push(computeIntersection(S, E, clipEdge));
                }
                outputList.push(E);
            } else if (inside(S, clipEdge)) {
                outputList.push(computeIntersection(S, E, clipEdge));
            }
            S = E;
        });
    });

    return outputList;
}