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
    state.areQueriesVisible = true;

    let queryId = idOverride;
    if (idOverride === null) {
        queryId = 0;
        do queryId++;
        while (state.queries.has(queryId));
    }

    let count = 0;
    let queryColor;
    do queryColor = getColor(count++);
    while (state.queries.values().some(q => q.color === queryColor));

    count = 0;
    let queryContent;
    if (queryId <= 0) {
        queryContent = state.viewportStates.get(-queryId).name;
    }
    else {
        queryContent = `Query ${queryId}`;
        while (state.queries.values().some(q => q.content === queryContent))
            queryContent = `Query ${queryId++}`;
    }

    state.queries.set(queryId, {
        id: queryId,
        content: queryContent,
        color: queryColor
    });
    state.selectedQuery = { id: queryId, type: "query" };

    if (addShape) {
        createNewShape(state, queryId);
    }
}

export function removeQuery(state, queryId) {
    state.queries.delete(queryId);
    state.visibleQueryShapeRows.delete(queryId);

    for (const view of state.viewportStates.values()) {
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
    while (state.activeView.shapes.has(shapeId));

    const radius = 150;
    const point = positionOverride === null ? findEmpySpace(state, radius) : positionOverride;
    state.activeView.shapes.set(shapeId, {
        shapeId: shapeId,
        queryId: queryId,
        shapeType: queryId <= 0 ? shapeType.Rhombus : shapeType.Circle,
        center: point,
        radius: radius,
        radius2: radius,
    });
    state.visibleQueryShapeRows = new Set([queryId]);
    state.boxSelectionBox = null;

    updateAll(state);
}

export function removeShape(state, shapeId, update = true) {
    state.activeView.shapes.delete(shapeId);

    if (update) {
        resetState(state);

        updateAll(state);
    }
}

export function isInactiveFragment(state, shapes) {
    const i = toInt(shapes);
    return state.activeView.allInactiveFragments.has(i);
}

export function toggleInactiveFragment(state, shapes) {
    const i = toInt(shapes);
    if (isInactiveFragment(state, shapes)) {
        state.activeView.allInactiveFragments.delete(i);
    } else {
        state.activeView.allInactiveFragments.add(i);
    }
    updateAll(state);
}

export function resetState(state) {
    state.hoveredQueries = new Set();
    state.hoveredShapes = new Set();
    state.hoveredFragments = new Set();
    state.hoveringType = hoverType.viewport;
    state.selectedShapes = new Set();
    state.boxSelectionBox = null;
    state.isBoxSelecting = false;

    for (const view of state.viewportStates.values()) {
        for (const inac of view.allInactiveFragments) {
            const shapes = toShapes(inac);
            if (!shapes.every(shapeId => view.shapes.has(shapeId))) {
                state.activeView.allInactiveFragments.delete(inac);
            }
        }
    }
}

export function addNewViewport(state, stayInCurrentViewport = false) {
    let id = 0;
    while (state.viewportStates.has(id))
        id++;

    const name = `Variable ${numberToLetter(id)}`;
    const newView = new ViewportState(id, name);

    state.viewportStates.set(id, newView);
    createNewQuery(state, -id, false);
    
    if (stayInCurrentViewport) {
        state.selectedQuery = { id: id, type: "title-temp" };   
    }
    else {
        state.activeView = newView;
        state.selectedQuery = { id: id, type: "title" };
        switchViewport(state, id);
    }
    return id;
}

export function addNewCodeViewport(state) {
    let id = 0;
    while (state.viewportStates.has(id))
        id++;

    const name = `View ${numberToLetter(id)}`;
    const newView = new ViewportState(id, name);

    state.viewportStates.set(id, newView);
    createNewQuery(state, -id, false);
    
    switchViewport(state, id);
    return id;
}


export function createViewportFromShapes(state, shapeIds) {
    const shapes = new Map();
    let center = { x: 0, y: 0 };
    for (const shape of shapeIds) {
        const shapInst = state.activeView.shapes.get(shape);
        center.x += shapInst.center.x;
        center.y += shapInst.center.y;
        shapes.set(shape, shapInst);

        removeShape(state, shape, false);
    }
    center.x /= Math.max(1, shapeIds.size);
    center.y /= Math.max(1, shapeIds.size);

    const id = addNewViewport(state, true);
    state.viewportStates.get(id).shapes = shapes;

    createNewShape(state, -id, center);
}

export function removeViewport(state, viewportId) {
    if (viewportId === 0) {
        console.log("Cannot remove main view");
        return;
    }

    state.viewportStates.delete(viewportId);
    removeQuery(state, -viewportId);
    state.isViewportSelectionVisible = false;
    switchViewport(state, 0);
}

export function updateViewportName(state, viewportId, name) {
    state.viewportStates.get(viewportId).name = name;
    state.queries.get(-viewportId).content = name;
    updateAll(state);
}

export function switchViewport(state, index) {
    state.activeView = state.viewportStates.get(index);
    resetState(state)
    updateAll(state);
}

export function setHoverFromShapes(state, shapes, hoverType) {
    state.hoveringType = hoverType;

    state.hoveredQueries = getQueriesFromShapes(state, shapes);
    state.hoveredShapes = shapes;
    state.hoveredFragments = getFragmentsFromShapes(state, shapes);
}

export function setHoverFromFragments(state, fragments, hoverType) {
    state.hoveringType = hoverType;

    state.hoveredFragments = fragments;
    state.hoveredShapes = getShapesFromFragments(state, fragments);
    state.hoveredQueries = getQueriesFromShapes(state, state.hoveredShapes);
}

export function setHoverFromQueris(state, queries, hoverType) {
    state.hoveringType = hoverType;

    state.hoveredQueries = queries;
    state.hoveredShapes = getShapesFromQuery(state, queries);
    state.hoveredFragments = getFragmentsFromShapes(state, state.hoveredShapes);
}
