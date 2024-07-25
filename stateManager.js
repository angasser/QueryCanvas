import { ExpressionLocation, TaskExpressionState, TaskState, ViewportState, hoverType, shapeType, toolType } from './structs.js';
import { areIterablesEqual, deserializeTaskExpression, getAllOccurrences, getColor, getFragmentsFromShapes, getQueriesFromShapes, getRandomId, getShapesFromFragments, getShapesFromQuery, isSubset, numberToLetter, serializeTaskExpression, toInt, toShapes } from './util.js';
import { updateUi } from './uiDisplay.js';
import { updateViewport, findEmpySpace } from './viewport.js';
import { charsSinceLastBreak, convertExpToString, convertVennToString } from './codeDisplay.js';

export function updateAll(state, uiDelayable = false) {
    updateViewport(state.viewport, state);
    if (uiDelayable) {
        state.uiDisplay.isDirty = true;
    }
    else {
        updateUi(state.uiDisplay, state);
    }

    // if (state.activeExpression !== null) {
    //     console.log(state.activeExpression);
    //     console.log(convertExpToString(state, state.activeExpression));
    //     console.log(serializeTaskExpression(state.activeExpression));
    // }
}

export function createNewQuery(state, expression, idOverride = null, addShape = true) {
    expression.areQueriesVisible = true;

    let queryId = idOverride;
    if (idOverride === null) {
        queryId = 0;
        do queryId++;
        while (expression.queries.has(queryId));
    }

    let count = 0;
    let queryColor;
    do queryColor = getColor(count++);
    while (expression.queries.values().some(q => q.color === queryColor));

    count = 0;
    let queryContent;
    if (queryId <= 0) {
        queryContent = expression.viewportStates.get(-queryId).name;
    }
    else {
        queryContent = `Query ${queryId}`;
        while (expression.queries.values().some(q => q.content === queryContent))
            queryContent = `Query ${queryId++}`;
    }

    expression.queries.set(queryId, {
        id: queryId,
        content: queryContent,
        color: queryColor
    });
    expression.selectedQuery = { id: queryId, type: "query" };

    if (addShape) {
        createNewShape(state, queryId);
    }
}

export function removeQuery(state, queryId) {
    state.activeExpression.queries.delete(queryId);
    state.activeExpression.visibleQueryShapeRows.delete(queryId);

    for (const view of state.activeExpression.viewportStates.values()) {
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
    while (state.activeExpression.activeView.shapes.has(shapeId));

    const radius = 150;
    const point = positionOverride === null ? findEmpySpace(state, radius) : positionOverride;
    state.activeExpression.activeView.shapes.set(shapeId, {
        shapeId: shapeId,
        queryId: queryId,
        shapeType: queryId <= 0 ? shapeType.Rhombus : shapeType.Circle,
        center: point,
        radius: radius,
        radius2: radius,
    });
    state.activeExpression.visibleQueryShapeRows = new Set([queryId]);
    state.activeExpression.boxSelectionBox = null;

    updateAll(state);
}

export function removeShape(state, shapeId, update = true) {
    state.activeExpression.activeView.shapes.delete(shapeId);

    if (update) {
        resetState(state);

        updateAll(state);
    }
}

export function isInactiveFragment(state, shapes) {
    const i = toInt(shapes);
    return state.activeExpression.activeView.allInactiveFragments.has(i);
}

export function toggleInactiveFragment(state, shapes) {
    const i = toInt(shapes);
    if (isInactiveFragment(state, shapes)) {
        state.activeExpression.activeView.allInactiveFragments.delete(i);
    } else {
        state.activeExpression.activeView.allInactiveFragments.add(i);
    }

    updateAll(state);
}

export function resetState(state) {
    state.activeExpression.hoveredQueries = new Set();
    state.activeExpression.hoveredShapes = new Set();
    state.activeExpression.hoveredFragments = new Set();
    state.activeExpression.hoveringType = hoverType.viewport;
    state.activeExpression.selectedShapes = new Set();
    state.activeExpression.boxSelectionBox = null;
    state.activeExpression.isBoxSelecting = false;

    for (const view of state.activeExpression.viewportStates.values()) {
        for (const inac of view.allInactiveFragments) {
            const shapes = toShapes(inac);
            if (!shapes.every(shapeId => view.shapes.has(shapeId))) {
                state.activeExpression.activeView.allInactiveFragments.delete(inac);
            }
        }
    }
}

export function addNewViewport(state, stayInCurrentViewport = false) {
    let id = 0;
    while (state.activeExpression.viewportStates.has(id))
        id++;

    const name = `Variable ${numberToLetter(id)}`;
    const newView = new ViewportState(id, name);

    state.activeExpression.viewportStates.set(id, newView);
    createNewQuery(state, state.activeExpression, -id, false);
    
    if (stayInCurrentViewport) {
        state.activeExpression.selectedQuery = { id: id, type: "title-temp" };   
    }
    else {
        state.activeExpression.activeView = newView;
        state.activeExpression.selectedQuery = { id: id, type: "title" };
        switchViewport(state, id);
    }
    return id;
}

export function addNewCodeViewport(state) {
    let id = 0;
    while (state.activeExpression.viewportStates.has(id))
        id++;

    const name = `View ${numberToLetter(id)}`;
    const newView = new ViewportState(id, name);

    state.activeExpression.viewportStates.set(id, newView);
    createNewQuery(state, state.activeExpression, -id, false);
    
    switchViewport(state, id);
    return id;
}


export function createViewportFromShapes(state, shapeIds) {
    const oldView = state.activeExpression.activeView;
    const inacFrag = new Set();
    for (const inac of oldView.allInactiveFragments) {
        const shapes = toShapes(inac);
        if (isSubset(shapes, shapeIds)) {
            inacFrag.add(inac);
        }
    }

    const shapes = new Map();
    let center = { x: 0, y: 0 };
    for (const shape of shapeIds) {
        const shapInst = oldView.shapes.get(shape);
        center.x += shapInst.center.x;
        center.y += shapInst.center.y;
        shapes.set(shape, shapInst);

        removeShape(state, shape, false);
    }
    center.x /= Math.max(1, shapeIds.size);
    center.y /= Math.max(1, shapeIds.size);

    updateAll(state, true);

    const id = addNewViewport(state, false);
    const newView = state.activeExpression.viewportStates.get(id);
    newView.shapes = shapes;
    newView.allInactiveFragments = inacFrag;
    updateAll(state, true);
    switchViewport(state, oldView.id);
    createNewShape(state, -id, center);
}

export function removeViewport(state, viewportId) {
    if (viewportId === 0) {
        console.log("Cannot remove main view");
        return;
    }

    state.activeExpression.viewportStates.delete(viewportId);
    removeQuery(state, -viewportId);
    state.activeExpression.isViewportSelectionVisible = false;
    switchViewport(state, 0);
}

export function updateViewportName(state, viewportId, name) {
    state.activeExpression.viewportStates.get(viewportId).name = name;
    state.activeExpression.queries.get(-viewportId).content = name;
    updateAll(state);
}

export function switchViewport(state, index) {
    state.activeExpression.activeView = state.activeExpression.viewportStates.get(index);
    resetState(state)
    updateAll(state);
}

export function setHoverFromShapes(state, shapes, hoverType) {
    state.activeExpression.hoveringType = hoverType;

    state.activeExpression.hoveredQueries = getQueriesFromShapes(state, shapes);
    state.activeExpression.hoveredShapes = shapes;
    state.activeExpression.hoveredFragments = getFragmentsFromShapes(state, shapes);
}

export function setHoverFromFragments(state, fragments, hoverType) {
    state.activeExpression.hoveringType = hoverType;

    state.activeExpression.hoveredFragments = fragments;
    state.activeExpression.hoveredShapes = getShapesFromFragments(state, fragments);
    state.activeExpression.hoveredQueries = getQueriesFromShapes(state, state.activeExpression.hoveredShapes);
}

export function setHoverFromQueris(state, queries, hoverType) {
    state.activeExpression.hoveringType = hoverType;

    state.activeExpression.hoveredQueries = queries;
    state.activeExpression.hoveredShapes = getShapesFromQuery(state.activeExpression.activeView, queries);
    state.activeExpression.hoveredFragments = getFragmentsFromShapes(state, state.activeExpression.hoveredShapes);
}

export function defaultExpressionState(state) {
    const exp = new TaskExpressionState(0,
        new ExpressionLocation(0, 0, 0),
        new ExpressionLocation(0, 0, 0),
        new Map(),
        new Map([[0, new ViewportState(0, "Main View")]]));
    
    createNewQuery(state, exp, 0, false);
    return exp;
}



export function createTask(state, title, taskDesc, queryDesc, codeDesc, codeString, expressionMap) {
    const expressions = new Map();
    for (const [key, value] of expressionMap) {
        let id;
        do id = getRandomId();
        while (expressions.has(id));

        const varI = codeString.indexOf(`[${key}v]`);
        codeString = codeString.replace(`[${key}v]`, value.varString);
        const varLoc = new ExpressionLocation(id, varI, varI + value.varString.length);

        const qI = codeString.indexOf(`[${key}]`);
        codeString = codeString.replace(`[${key}]`, value.expressionString);
        const loc = new ExpressionLocation(id, qI, qI + value.expressionString.length);
        
        const exp = deserializeTaskExpression(value.expression);
        exp.id = id;
        exp.loc = loc;
        exp.varLoc = varLoc;
        expressions.set(id, exp);
    }

    return new TaskState(title, taskDesc, queryDesc, codeDesc, codeString, expressions);
}

export function switchTask(state, taskTitle) {
    state.activeTask.hasBeenViewed = true;
    state.activeTask = state.tasks.get(taskTitle);
    state.activeExpression = state.activeTask.activeExpression;

    state.selectedToolTab = state.activeTask.codeString !== "" ? toolType.code : toolType.result;
    updateAll(state);
}

export function switchExpression(state, expression) {
    state.activeExpression = expression;

    state.activeTask.activeExpression = expression;
    if(expression !== null)
        state.activeExpression.activeView = state.activeExpression.viewportStates.get(0);
    updateAll(state);
}


