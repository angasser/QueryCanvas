import { drawCanvasQueryCircle } from "../UI/uiDisplay.js";
import { transformPoint } from "./viewport.js";

const DISPLAY_TEXT = true;

export function updateQueryTags(state) {
    state.uiDisplay.queryTagRef.innerHTML = '';

    for (const shape of state.activeExpression.activeView.shapes.values()) {
        addQueryTag(state, shape);
    }

    updateBoxHover(state);
}

export function updateBoxHover(state) {
    if (state.activeExpression.boxSelectionBox !== null) {
        const view = state.activeExpression.activeView;
        const box = state.activeExpression.boxSelectionBox;
        const tl = transformPoint(view, { x: box.minX, y: box.minY });
        const br = transformPoint(view, { x: box.maxX, y: box.maxY });
        const boxRef = state.uiDisplay.boundingBoxRef.style;
        boxRef.display = 'block';
        boxRef.left = `${tl.x}px`;
        boxRef.top = `${tl.y}px`;
        boxRef.width = `${br.x - tl.x-4}px`;
        boxRef.height = `${br.y - tl.y-4}px`;
    }
    else
        state.uiDisplay.boundingBoxRef.style.display = 'none';
}

function addQueryTag(state, shape) {
    // if (shape.shapeType === shapeType.Rectangle)
    //     return;

    const c = state.viewport.mainContext;
    const center = transformPoint(state.activeExpression.activeView, shape.center);

    const query = state.activeExpression.queries.get(shape.queryId);
    if (DISPLAY_TEXT) {
        c.font = '20px Arial';
        c.textAlign = 'center';
        c.fillStyle = 'black';
        c.fillText(query.content, center.x, center.y + 20);
        
        drawCanvasQueryCircle(c, query, { x: center.x, y: center.y - 30 }, 1);
    }
    else {
        drawCanvasQueryCircle(c, query, { x: center.x, y: center.y }, 1);
    }

}