import { drawBackground, initBackgroundPattern } from "./viewportBackground.js";
import { colorLerp, drawFragment, getShapePoints, hexToRgb, toInt, toShapes } from "../util.js";
import { shapeType, fragmentIterator, hoverType } from "../structs.js";
import { updateQueryTags } from "./uiQueryTags.js";
import { intersect } from "./intersectPolygon.js";


export class Viewport {
    constructor() {
        this.backgroundCanvas = document.querySelector('#backgroundCanvas');
        this.mainCanvas = document.querySelector('#mainCanvas');

        this.bgContext = this.backgroundCanvas.getContext('2d');
        this.mainContext = this.mainCanvas.getContext('2d');


        initBackgroundPattern(this, 150);
        // this.updateCanvasSize();
    }

    updateCanvasSize(state) {
        const width = window.innerWidth - 2;
        const height = window.innerHeight - 2;
        this.backgroundCanvas.width = width;
        this.backgroundCanvas.height = height;
        this.mainCanvas.width = width;
        this.mainCanvas.height = height;
        this.redrawBackground(state);
    }

    redrawBackground(state) {
        if (state.activeExpression !== null) {
            const view = state.activeExpression.activeView;
            drawBackground(this.bgContext, this, view.trans, view.scale);
        }    
        else
            drawBackground(this.bgContext, this, {x: 0, y: 0}, 1);
    }
}

export function updateViewport(canvas, state, viewportRecalculate=true) {
    if (canvas.mainCanvas.width !== window.innerWidth - 2 ||
        canvas.mainCanvas.height !== window.innerHeight - 2) {
        canvas.updateCanvasSize(state);
    }

    const c = canvas.mainContext;
    c.clearRect(0, 0, canvas.mainCanvas.width, canvas.mainCanvas.height);

    if (state.activeExpression === null) {
        state.uiDisplay.queryTagRef.innerHTML = '';
        return;
    }

    const activeView = state.activeExpression.activeView;

    if (viewportRecalculate) {
        activeView.fragments = new Map();
        const iter = new fragmentIterator(activeView.shapes);
        while (iter.hasNext()) {
            const fragShapes = iter.next();
            let points;
            let color = [0, 0, 0];
            if (fragShapes.length === 0) {
                continue;
            }

        
            if (fragShapes.length === 1) {
                const shape = activeView.shapes.get(fragShapes[0]);
                const query = state.activeExpression.queries.get(shape.queryId);
                points = getShapePoints(shape);
                color = hexToRgb(query.color);
            }
            else {
                const prevI = toInt(fragShapes.slice(0, fragShapes.length - 1));
                if (!activeView.fragments.has(toInt(fragShapes.slice(0, fragShapes.length - 1))))
                    continue;

                const prevFrag = activeView.fragments.get(prevI);
                const newFrag = activeView.fragments.get(toInt([fragShapes[fragShapes.length - 1]]));
                points = intersect(prevFrag.points, newFrag.points);
                color = colorLerp(prevFrag.color, newFrag.color, 1 / fragShapes.length);
            }

            if (points === undefined ||
                points.length === 0 ||
                points.some(p => p.x < -1000 || p.y < -1000)) continue;

            const i = toInt(fragShapes);
            const isHovered = state.activeExpression.hoveredFragments.has(i);
            const isInverted = state.activeExpression.activeView.allInactiveFragments.has(i);

            activeView.fragments.set(i, {
                fragmentId: i,
                points: points,
                color: color,
                isInverted: isInverted,
                isHovered: isHovered,
            });
        }
    }


    for (const frag of activeView.fragments.values()) {
        drawFragment(c, activeView, frag);
    }

    updateQueryTags(state);
}

export function transformPoint(view, point) {
    let transformedX = point.x + view.trans.x;
    let transformedY = point.y + view.trans.y;

    transformedX *= view.scale;
    transformedY *= view.scale;

    return { x: transformedX, y: transformedY };
}

export function inverseTransformPoint(view, point) {
    let transformedX = (point.x / view.scale) - view.trans.x;
    let transformedY = (point.y / view.scale) - view.trans.y;

    return { x: transformedX, y: transformedY };
}

export function findEmpySpace(state, radius) {
    const t = inverseTransformPoint(state.activeExpression.activeView, { x: window.innerWidth / 2, y: window.innerHeight / 2 });
    let xc = t.x;;
    let yc = t.y;

    for (let i = 0; i < 100; i++) {
        for (let x = -i; x <= i; x ++) {
            for (let y = -i; y <= i; y++) {
                const p = { x: xc + x * radius, y: yc + y * radius };
                if (getShapesUnderPoint(p, state).size === 0) {

                    return p;
                }
            }
        }
    }

    return { x: xc, y: yc };
}

export function getClosestShape(point, state) {
    let closestShape = null;
    let closestDistance = Infinity;

    for (const shape of state.activeExpression.activeView.shapes.values()) {
        const dx = point.x - shape.center.x;
        const dy = point.y - shape.center.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < closestDistance) {
            closestShape = shape;
            closestDistance = distance;
        }
    }

    return closestShape;
}

export function getShapesUnderPoint(point, state) {
    const shapes = new Set();
    for (const shape of state.activeExpression.activeView.shapes.values()) {
        if (isPointInShape(point, shape)) {
            shapes.add(shape.shapeId);
        }
    }
    return shapes;
}

export function isPointInShape(point, shape)
{
    if(shape.shapeType === shapeType.Circle)
    {
        const dx = point.x - shape.center.x;
        const dy = point.y - shape.center.y;
        return dx * dx + dy * dy <= shape.radius * shape.radius;
    }
    else if(shape.shapeType === shapeType.Rectangle)
    {
        return point.x >= shape.center.x - shape.radius && point.x <= shape.center.x + shape.radius &&
            point.y >= shape.center.y - shape.radius2 && point.y <= shape.center.y + shape.radius2;
    }
    else if(shape.shapeType === shapeType.Rhombus)
    {
        const dx = Math.abs(point.x - shape.center.x);
        const dy = Math.abs(point.y - shape.center.y);
        return dx + dy <= shape.radius;
    }
}

export function getAllOverlapping(view, shapeIds)
{
    if (shapeIds.length === 0)
        return [];

    let result = null;

    const i = toInt(shapeIds);
    for (const f of view.fragments.keys()) {
        if ((f & i) !== i)
            continue;

        if (result === null) {
            result = f;
        } else {
            result |= f;
        }
    }
    return toShapes(result);
}
