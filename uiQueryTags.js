import { getQueryCircle } from "./uiDisplay.js";

export function updateQueryTags(state) {
    state.uiDisplay.queryTagRef.innerHTML = '';

    for (const shape of state.activeState.activeView.shapes.values()) {
        addQueryTag(state, shape);
    }

    updateBoxHover(state);
}

export function updateBoxHover(state) {
        if (state.activeState.boxSelectionBox !== null) {
        const box = state.activeState.boxSelectionBox;
        const boxRef = state.uiDisplay.boundingBoxRef.style;
        boxRef.display = 'block';
        boxRef.left = `${box.minX}px`;
        boxRef.top = `${box.minY}px`;
        boxRef.width = `${box.maxX-box.minX-4}px`;
        boxRef.height = `${box.maxY - box.minY-4}px`;
    }
    else
        state.uiDisplay.boundingBoxRef.style.display = 'none';
}

function addQueryTag(state, shape) {
    const tag = document.createElement('div');
    tag.style.display = 'flex';
    tag.style.pointerEvents = 'none';
    tag.style.position = 'absolute'; 
    tag.style.left = `${shape.center.x}px`;
    tag.style.top = `${shape.center.y}px`;
    tag.style.flexDirection = 'column';
    tag.style.justifyContent = 'center';
    tag.style.alignItems = 'center';
    tag.style.transform = 'translate(-50%, -50%)';
    tag.style.zIndex = '100';
    tag.style.fontSize = '24px';
    
    const query = state.activeState.queries.get(shape.queryId);
    tag.innerHTML = `
        ${getQueryCircle(state, query.id)}
        ${query.content}
    `;

    state.uiDisplay.queryTagRef.appendChild(tag);
}