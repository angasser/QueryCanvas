import { ViewportState, hoverType, shapeType, toolType } from './structs.js';
import { getColor, getFragmentsFromShapes, getQueriesFromShapes, getShapesFromFragments, getShapesFromQuery, numberToLetter, toInt, toShapes } from './util.js';
import { updateUi } from './uiDisplay.js';
import { updateViewport, findEmpySpace } from './viewport.js';

export function updateAll(state, uiDelayable = false) {
    console.log("updateAll");
    updateViewport(state.viewport, state);

    if (uiDelayable) {
        state.uiDisplay.isDirty = true;
    }
    else {
        updateUi(state.uiDisplay, state);
    }
}

export function createNewQuery(state, idOverride = null, addShape = true) {
    state.activeState.areQueriesVisible = true;

    let queryId = idOverride;
    if (idOverride === null) {
        queryId = 0;
        do queryId++;
        while (state.activeState.queries.has(queryId));
    }

    let count = 0;
    let queryColor;
    do queryColor = getColor(count++);
    while (state.activeState.queries.values().some(q => q.color === queryColor));

    count = 0;
    let queryContent;
    if (queryId <= 0) {
        queryContent = state.activeState.viewportStates.get(-queryId).name;
    }
    else {
        queryContent = `Query ${queryId}`;
        while (state.activeState.queries.values().some(q => q.content === queryContent))
            queryContent = `Query ${queryId++}`;
    }

    state.activeState.queries.set(queryId, {
        id: queryId,
        content: queryContent,
        color: queryColor
    });
    state.activeState.selectedQuery = { id: queryId, type: "query" };

    if (addShape) {
        createNewShape(state, queryId);
    }
}

export function removeQuery(state, queryId) {
    state.activeState.queries.delete(queryId);
    state.activeState.visibleQueryShapeRows.delete(queryId);

    for (const view of state.activeState.viewportStates.values()) {
        for (const shape of view.shapes.values()) {
            if (shape.queryId === queryId) {
                view.shapes.delete(shape.shapeId);
            }
        }
    }
    resetState(state);

    updateAll(state);
}


export function createNewShape(state, queryId, positionOverride = null) {

    let shapeId = -1;
    do shapeId++;
    while (state.activeState.activeView.shapes.has(shapeId));

    const radius = 150;
    const point = positionOverride === null ? findEmpySpace(state, radius) : positionOverride;
    state.activeState.activeView.shapes.set(shapeId, {
        shapeId: shapeId,
        queryId: queryId,
        shapeType: queryId <= 0 ? shapeType.Rhombus : shapeType.Circle,
        center: point,
        radius: radius,
        radius2: radius,
    });
    state.activeState.visibleQueryShapeRows = new Set([queryId]);
    state.activeState.boxSelectionBox = null;

    updateAll(state);
}

export function removeShape(state, shapeId, update = true) {
    state.activeState.activeView.shapes.delete(shapeId);

    if (update) {
        resetState(state);

        updateAll(state);
    }
}

export function isInactiveFragment(state, shapes) {
    const i = toInt(shapes);
    return state.activeState.activeView.allInactiveFragments.has(i);
}

export function toggleInactiveFragment(state, shapes) {
    const i = toInt(shapes);
    if (isInactiveFragment(state, shapes)) {
        state.activeState.activeView.allInactiveFragments.delete(i);
    } else {
        state.activeState.activeView.allInactiveFragments.add(i);
    }
    updateAll(state);
}

export function resetState(state) {
    state.activeState.hoveredQueries = new Set();
    state.activeState.hoveredShapes = new Set();
    state.activeState.hoveredFragments = new Set();
    state.activeState.hoveringType = hoverType.viewport;
    state.activeState.selectedShapes = new Set();
    state.activeState.boxSelectionBox = null;
    state.activeState.isBoxSelecting = false;

    for (const view of state.activeState.viewportStates.values()) {
        for (const inac of view.allInactiveFragments) {
            const shapes = toShapes(inac);
            if (!shapes.every(shapeId => view.shapes.has(shapeId))) {
                state.activeState.activeView.allInactiveFragments.delete(inac);
            }
        }
    }
}

export function addNewViewport(state, stayInCurrentViewport = false) {
    let id = 0;
    while (state.activeState.viewportStates.has(id))
        id++;

    const name = `Variable ${numberToLetter(id)}`;
    const newView = new ViewportState(id, name);

    state.activeState.viewportStates.set(id, newView);
    createNewQuery(state, -id, false);
    
    if (stayInCurrentViewport) {
        state.activeState.selectedQuery = { id: id, type: "title-temp" };   
    }
    else {
        state.activeState.activeView = newView;
        state.activeState.selectedQuery = { id: id, type: "title" };
        switchViewport(state, id);
    }
    return id;
}

export function addNewCodeViewport(state) {
    let id = 0;
    while (state.activeState.viewportStates.has(id))
        id++;

    const name = `View ${numberToLetter(id)}`;
    const newView = new ViewportState(id, name);

    state.activeState.viewportStates.set(id, newView);
    createNewQuery(state, -id, false);
    
    switchViewport(state, id);
    return id;
}


export function createViewportFromShapes(state, shapeIds) {
    const shapes = new Map();
    let center = { x: 0, y: 0 };
    for (const shape of shapeIds) {
        const shapInst = state.activeState.activeView.shapes.get(shape);
        center.x += shapInst.center.x;
        center.y += shapInst.center.y;
        shapes.set(shape, shapInst);

        removeShape(state, shape, false);
    }
    center.x /= Math.max(1, shapeIds.size);
    center.y /= Math.max(1, shapeIds.size);

    const id = addNewViewport(state, true);
    state.activeState.viewportStates.get(id).shapes = shapes;

    createNewShape(state, -id, center);
}

export function removeViewport(state, viewportId) {
    if (viewportId === 0) {
        console.log("Cannot remove main view");
        return;
    }

    state.activeState.viewportStates.delete(viewportId);
    removeQuery(state, -viewportId);
    state.activeState.isViewportSelectionVisible = false;
    switchViewport(state, 0);
}

export function updateViewportName(state, viewportId, name) {
    state.activeState.viewportStates.get(viewportId).name = name;
    state.activeState.queries.get(-viewportId).content = name;
    updateAll(state);
}

export function switchViewport(state, index) {
    state.activeState.activeView = state.activeState.viewportStates.get(index);
    resetState(state)
    updateAll(state);
}

export function setHoverFromShapes(state, shapes, hoverType) {
    state.activeState.hoveringType = hoverType;

    state.activeState.hoveredQueries = getQueriesFromShapes(state, shapes);
    state.activeState.hoveredShapes = shapes;
    state.activeState.hoveredFragments = getFragmentsFromShapes(state, shapes);
}

export function setHoverFromFragments(state, fragments, hoverType) {
    state.activeState.hoveringType = hoverType;

    state.activeState.hoveredFragments = fragments;
    state.activeState.hoveredShapes = getShapesFromFragments(state, fragments);
    state.activeState.hoveredQueries = getQueriesFromShapes(state, state.activeState.hoveredShapes);
}

export function setHoverFromQueris(state, queries, hoverType) {
    state.activeState.hoveringType = hoverType;

    state.activeState.hoveredQueries = queries;
    state.activeState.hoveredShapes = getShapesFromQuery(state, queries);
    state.activeState.hoveredFragments = getFragmentsFromShapes(state, state.activeState.hoveredShapes);
}
