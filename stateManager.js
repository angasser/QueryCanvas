import { ExpressionLocation, TaskExpressionState, TaskState, ViewportState, hoverType, interactionType, modifyMode, shapeType, toolType } from './structs.js';
import { deserializeTaskExpression, getColor, getFragmentsFromShapes, getQueriesFromShapes, getRandomId, getShapesFromFragments, getShapesFromQuery, isSubset, numberToLetter, serializeTaskExpression, setElementInteraction, toInt, toShapes } from './util.js';
import { updateUi } from './UI/uiDisplay.js';
import { updateViewport, findEmpySpace } from './viewport/viewport.js';
import { checkTutorialPageFinished, updateTutorialPage } from './UI/tutorial.js';
import { convertExpToString, convertVennToString } from './UI/codeDisplay.js';

export function updateAll(state, uiDelayable = false, viewportRecalculate = true) {
    updateViewport(state.viewport, state, viewportRecalculate);
    if (uiDelayable) {
        state.uiDisplay.isDirty = true;
    }
    else {
        updateUi(state.uiDisplay, state);
    }

    checkTutorialPageFinished(state, state.tutorial);
    // if (state.activeExpression !== null) {
    //     console.log(state.activeExpression);
    //     console.log(serializeTaskExpression(state.activeExpression));
    //     console.log(convertExpToString(state, state.activeExpression));
    // }
}

export function createNewQuery(state, expression, idOverride = null, addShape = true, shouldSave = true) {
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
        queryContent = `Query_${queryId}`;
        while (expression.queries.values().some(q => q.content === queryContent))
            queryContent = `Query_${queryId++}`;
    }

    expression.queries.set(queryId, {
        id: queryId,
        content: queryContent,
        color: queryColor
    });
    expression.selectedQuery = { id: queryId, type: "query" };


    if (addShape) {
        createNewShape(state, queryId, null, false);
    }

    if(shouldSave)
        saveState(state, "Added new query " + queryContent);
}

export function removeQuery(state, queryId, doSave = true) {
    const exp = state.activeExpression;
    const query = exp.queries.get(queryId);
    exp.queries.delete(queryId);
    exp.visibleQueryShapeRows.delete(queryId);

    for (const view of exp.viewportStates.values()) {
        for (const shape of view.shapes.values()) {
            if (shape.queryId === queryId) {
                view.shapes.delete(shape.shapeId);
            }
        }
    }
    resetState(state);

    if(doSave && query !== undefined)
        saveState(state, "Removed query " + query.content);

    updateAll(state);
}


export function createNewShape(state, queryId, positionOverride = null, shouldSave = true) {

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

    if(shouldSave)
        saveState(state, "Added new shape from " + state.activeExpression.queries.get(queryId).content);
    updateAll(state);
}

export function removeShape(state, shapeId, update = true, shouldSave = true) {
    const exp = state.activeExpression;
    const shape = exp.activeView.shapes.get(shapeId);
    exp.activeView.shapes.delete(shapeId);

    if (shouldSave && shape !== undefined) {
        const query = exp.queries.get(shape.queryId);
        saveState(state, "Removed shape from " + query.content);
    }

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

    saveState(state, "Toggled Venn diagram fragment");
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

export function addNewViewport(state, stayInCurrentViewport = false, shouldSave = true) {
    let id = 0;
    while (state.activeExpression.viewportStates.has(id))
        id++;

    const name = `Variable_${numberToLetter(id)}`;
    const newView = new ViewportState(id, name);

    state.activeExpression.viewportStates.set(id, newView);
    createNewQuery(state, state.activeExpression, -id, false, false);
    
    if (stayInCurrentViewport) {
        state.activeExpression.selectedQuery = { id: id, type: "title-temp" };   
    }
    else {
        state.activeExpression.activeView = newView;
        state.activeExpression.selectedQuery = { id: id, type: "title" };
        switchViewport(state, id);
    }

    if(shouldSave)
        saveState(state, "Added new variable " + name);

    return id;
}

// export function addNewCodeViewport(state) {
//     let id = 0;
//     while (state.activeExpression.viewportStates.has(id))
//         id++;

//     const name = `View ${numberToLetter(id)}`;
//     const newView = new ViewportState(id, name);

//     state.activeExpression.viewportStates.set(id, newView);
//     createNewQuery(state, state.activeExpression, -id, false);
    
//     switchViewport(state, id);
//     saveState(state);
//     return id;
// }


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

        removeShape(state, shape, false, false);
    }
    center.x /= Math.max(1, shapeIds.size);
    center.y /= Math.max(1, shapeIds.size);

    updateAll(state, true);

    const id = addNewViewport(state, false, false);
    const newView = state.activeExpression.viewportStates.get(id);
    newView.shapes = shapes;
    newView.allInactiveFragments = inacFrag;
    updateAll(state, true);
    switchViewport(state, oldView.id);
    createNewShape(state, -id, center, false);

    saveState(state, "Added new variable " + newView.name + " from shapes");
}

export function removeViewport(state, viewportId) {
    if (viewportId === 0) {
        console.log("Cannot remove main view");
        return;
    }

    const view = state.activeExpression.viewportStates.get(viewportId);

    state.activeExpression.viewportStates.delete(viewportId);
    removeQuery(state, -viewportId, false);
    state.activeExpression.isViewportSelectionVisible = false;

    if(view !== undefined)
        saveState(state, "Removed variable " + view.title);
    switchViewport(state, 0);
}

export function updateViewportName(state, viewportId, name) {
    const view = state.activeExpression.viewportStates.get(viewportId);
    const oldName = view.name;

    view.name = name;
    state.activeExpression.queries.get(-viewportId).content = name;

    if(oldName !== name)
        saveState(state, "Updated variable from " + oldName + " to " + name);
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
    
    createNewQuery(state, exp, 0, false, false);
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

    // if (title === "Tutorial") {
    //     state.tutorial.currentPage = 0;
    //     state.tutorial.unlockedPages = 0;
    //     updateTutorialPage(state.tutorial);
    // }

    const task = new TaskState(title, taskDesc, queryDesc, codeDesc, codeString, expressions);
    return task;
}

function applyModifyMode(state) {
    if (state.testGroup === -1)
        return;

    if (state.activeTask.title === "Tutorial" ||
        state.activeTask.title === "Sandbox" ||
        state.activeTask.title === "Test task: Plants"
    ) {
        state.modifyMode = modifyMode.QueryOnly;
        return;
    }

    if (state.testGroup === -2) {
        state.modifyMode = modifyMode.CodeOnly;
        return;
    }
    else if (state.testGroup === -3) {
        state.modifyMode = modifyMode.QueryOnly;
        return;
    }
    
    const parity = state.testGroup % 2;
    if (parity === 0) {
        console.log(state.taskGroup0, state.taskGroup0.has(state.activeTask.title));
        if(state.taskGroup0.has(state.activeTask.title))
            state.modifyMode = modifyMode.QueryOnly;
        else
            state.modifyMode = modifyMode.CodeOnly;
    }
    else {
        if(state.taskGroup1.has(state.activeTask.title))
            state.modifyMode = modifyMode.QueryOnly;
        else
            state.modifyMode = modifyMode.CodeOnly;
    }
}

export function switchTask(state, taskTitle) {
    if(state.activeTask !== null)
        state.activeTask.hasBeenViewed = true;

    state.undoStack = [];
    state.redoStack = [];

    state.activeTask = state.tasks.get(taskTitle);
    state.activeExpression = state.activeTask.activeExpression;

    state.selectedToolTab = taskTitle === "Tutorial" ? toolType.none :
        state.activeTask.codeString !== "" ? toolType.code : toolType.result;

    applyModifyMode(state);

    if (state.modifyMode === modifyMode.CodeOnly) {
        state.activeExpression = null;
    }
    
    saveState(state, "Switched to task " + taskTitle);
    if(state.activeExpression === null && taskTitle !== "Tutorial"){
        switchExpression(state, state.activeTask.expressions.values().next().value);
    }
    else
        updateAll(state);
}

export function switchExpression(state, expression) {
    applyModifyMode(state);
    state.activeExpression = expression;

    state.activeTask.activeExpression = expression;
    if(expression !== null)
        state.activeExpression.activeView = state.activeExpression.viewportStates.get(0);
    
    if (state.modifyMode === modifyMode.CodeOnly) {
        state.activeExpression = null;
    }

    updateAll(state);
    
}

export function saveState(state, tooltip) {
    state.redoStack = [];
    const clone = structuredClone(state.activeTask);
    state.undoStack.push(
        {
            state: clone,
            tooltip: tooltip
        });

    while (state.undoStack.length > 30) {
        state.undoStack.shift();
    }

    setElementInteraction(state.uiDisplay.undoButton, state.undoStack.length > 1 ? interactionType.None : interactionType.Disabled);
    setElementInteraction(state.uiDisplay.redoButton, state.redoStack.length > 0 ? interactionType.None : interactionType.Disabled);
}

export function overwriteState(state, tooltip) {
    if (state.undoStack.length > 1) {
        state.undoStack.pop();
    }    
    saveState(state, tooltip);
}


export function undoState(state) {
    if (state.undoStack.length <= 1)
        return;

    const undo = state.undoStack.pop();
    state.redoStack.push(undo);

    const newState = structuredClone(state.undoStack[state.undoStack.length-1].state);
    state.tasks.set(newState.title, newState);
    state.activeTask = newState;
    state.activeExpression = newState.activeExpression;
    updateAll(state);
}

export function redoState(state) {
    if (state.redoStack.length === 0)
        return;

    const redo = state.redoStack.pop();
    state.undoStack.push(redo);

    const newState = structuredClone(redo.state);
    state.tasks.set(newState.title, newState);
    state.activeTask = newState;
    state.activeExpression = newState.activeExpression;
    updateAll(state);
}

export function setTabWidth(tab, width) {
    tab.style.width = width + "px";
}
