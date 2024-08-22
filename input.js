import { getShapesUnderPoint, inverseTransformPoint } from './viewport/viewport.js';
import { initializeUiInput } from './UI/uiDisplay.js';
import { areSetsEqual, getQueriesFromShapes, getShapeBoundingBox, getShapesInBox, toInt } from './util.js';
import { saveState, setHoverFromFragments, setHoverFromShapes, switchViewport, toggleInactiveFragment, updateAll } from './stateManager.js';
import { updateBoxHover, updateQueryTags } from './viewport/uiQueryTags.js';
import { hoverType } from './structs.js';
import { initialzeCodeInput } from './UI/codeDisplay.js';

export class InputHandler {
    constructor(state) {
        this.state = state;
        this.viewport = state.viewport;
        this.uiDisplay = state.uiDisplay;
        this.isDragging = false;
        this.dragStartPoint = null;
        this.dragLastPoint = null;

        this.isRightClickDragging = false;
        this.rightClickDragStartPoint = null;

        this.mousePos = { x: 0, y: 0 };
        this.mouseViewPos = { x: 0, y: 0 };


        initializeInput(this, state.viewport.mainCanvas, state);
        initializeUiInput(state.uiDisplay, state);
        initialzeCodeInput(state, state.codeDisplay);
    }
}


function initializeInput(handler, canvas) {
    const state = handler.state;

    window.addEventListener('resize', () => {
        updateAll(state, true, true);
    });

    window.addEventListener('keydown', (e) => {
        const keysToDisable = [
            { ctrlKey: true, key: 'r' }, // Reload
            { ctrlKey: true, key: 'w' }, // Close tab
            { ctrlKey: true, key: 't' }, // New tab
            { ctrlKey: true, key: 'n' }, // New window
            { ctrlKey: true, shiftKey: true, key: 'n' }, // New incognito window
            { ctrlKey: true, key: 'h' }, // History
            { ctrlKey: true, key: 'j' }, // Downloads
            { ctrlKey: true, key: 'p' }, // Print
            { ctrlKey: true, key: 's' }, // Save
            { ctrlKey: true, shiftKey: true, key: 't' }, // Reopen closed tab
            { ctrlKey: true, shiftKey: true, key: 'w' }, // Close window
            { altKey: true, key: 'F4' }, // Close window (Alt+F4)
            { ctrlKey: true, key: 'd' }, // Bookmark
        ];

        keysToDisable.forEach((combo) => {
            if (
                (combo.ctrlKey === undefined || combo.ctrlKey === e.ctrlKey) &&
                (combo.shiftKey === undefined || combo.shiftKey === e.shiftKey) &&
                (combo.altKey === undefined || combo.altKey === e.altKey) &&
                combo.key === e.key
            ) {
                e.preventDefault();
            }
        });
    });

    canvas.addEventListener('mousedown', (e) => {
        if (!state.hasExp())
            return;

        if (e.button === 2) {
            handler.isRightClickDragging = true;
            handler.rightClickDragStartPoint = { x: e.clientX, y: e.clientY };

            e.preventDefault();
            return;
        }
        else
            leftClickDown(handler, canvas, e);
    });

    canvas.addEventListener('mousemove', (e) => {
        if (!state.hasExp())
            return;

        handler.mousePos = { x: e.clientX, y: e.clientY };
        handler.mouseViewPos = inverseTransformPoint(state.activeExpression.activeView, handler.mousePos);

        rightClickDrag(handler, canvas, e);
        leftClickDrag(handler, canvas, e);
    });

    canvas.addEventListener('mouseup', (e) => {
        if (!state.hasExp())
            return;

        if (e.button === 2 && handler.isRightClickDragging) { 
            handler.isRightClickDragging = false;
        }
        else
                leftClickUp(handler, canvas);
    });

    canvas.addEventListener('dblclick', (e) => {
        if (!state.hasExp())
            return;

        const rect = canvas.getBoundingClientRect();
        const hoveredShapes = getShapesUnderPoint(handler.mouseViewPos, state);
        if (hoveredShapes.size === 1) {
            for (const shapeId of hoveredShapes) {
                const shape = state.activeExpression.activeView.shapes.get(shapeId);
                if (shape.queryId <= 0) {
                    switchViewport(state, -shape.queryId);
                }
            }
        }
    });

    canvas.addEventListener('wheel', (e) => {
        if (!state.hasExp())
            return;

        const view = state.activeExpression.activeView;
        handler.mouseViewPos = inverseTransformPoint(view, { x: e.clientX, y: e.clientY });
        e.preventDefault(); // Prevent the page from scrolling

        const scaleFactor = 0.1; 
        const zoomIn = e.deltaY < 0; 

        // Calculate the new scale
        let newScale = zoomIn ? view.scale * (1 + scaleFactor) : view.scale / (1 + scaleFactor);
        newScale = Math.max(0.7, Math.min(2, newScale));

        const size = {x: window.innerWidth, y: window.innerHeight};
        const factor = (1 - (newScale / view.scale));
        const dx = (handler.mouseViewPos.x) * factor;
        const dy = (handler.mouseViewPos.y) * factor;

        view.trans.x += dx;
        view.trans.y += dy;
        view.scale = newScale;

        // Redraw or update the viewport to reflect the changes
        state.viewport.redrawBackground(state);
        updateAll(state, true);
    });

    canvas.addEventListener('contextmenu', function(e) {
        e.preventDefault();
    });
}

function leftClickDown(handler, canvas, e) {
    const state = handler.state;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const viewMouse = handler.mouseViewPos;

    if (state.activeExpression.boxSelectionBox !== null && 
        viewMouse.x >= state.activeExpression.boxSelectionBox.minX &&
        viewMouse.x <= state.activeExpression.boxSelectionBox.maxX &&
        viewMouse.y >= state.activeExpression.boxSelectionBox.minY &&
        viewMouse.y <= state.activeExpression.boxSelectionBox.maxY
    ) {
        handler.isDragging = true;
        handler.dragStartPoint = { x: mouseX, y: mouseY };
        handler.dragLastPoint = { x: mouseX, y: mouseY };
        state.activeExpression.selectedShapes = state.activeExpression.boxSelectedShapes; 
    }
    else if (state.activeExpression.hoveringType === hoverType.viewport && state.activeExpression.hoveredQueries.size !== 0) {
        handler.isDragging = true;
        handler.dragStartPoint = { x: mouseX, y: mouseY };
        handler.dragLastPoint = { x: mouseX, y: mouseY };
        state.activeExpression.selectedShapes = state.activeExpression.hoveredShapes;
        state.activeExpression.boxSelectionBox = null;
    }
    else {
        handler.state.activeExpression.isBoxSelecting = true;
        handler.dragStartPoint = { x: mouseX, y: mouseY };
    }
}

function leftClickDrag(handler, canvas, e) {
    const state = handler.state;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const view = state.activeExpression.activeView;
    if (handler.isDragging) {
        const dragOffset = {
            x: (mouseX - handler.dragLastPoint.x) / view.scale,
            y: (mouseY - handler.dragLastPoint.y) / view.scale,
        }

        handler.dragLastPoint = { x: mouseX, y: mouseY };

        for (const shapeId of state.activeExpression.selectedShapes) {
            const shape = state.activeExpression.activeView.shapes.get(shapeId);
            shape.center.x += dragOffset.x;
            shape.center.y += dragOffset.y;
        }

        if (state.activeExpression.boxSelectionBox !== null) {
            state.activeExpression.boxSelectionBox.minX += dragOffset.x;
            state.activeExpression.boxSelectionBox.minY += dragOffset.y;
            state.activeExpression.boxSelectionBox.maxX += dragOffset.x;
            state.activeExpression.boxSelectionBox.maxY += dragOffset.y;
        }

        updateAll(state, true);
    }

    if (handler.state.activeExpression.isBoxSelecting) {
        const start = inverseTransformPoint(view, handler.dragStartPoint);
        setBoxHover(start, handler.mouseViewPos, state);
    }
    else {
        setPointHover(handler, state);
    }
}

function leftClickUp(handler, canvas) {
    const state = handler.state;
    if (handler.isDragging) {
        const tolerance = 4; 
        const isClick = Math.abs(handler.dragStartPoint.x - handler.dragLastPoint.x) <= tolerance &&
            Math.abs(handler.dragStartPoint.y - handler.dragLastPoint.y) <= tolerance;
        if (isClick) {
            toggleInactiveFragment(handler.state, state.activeExpression.hoveredShapes);
        }

        handler.isDragging = false;
        handler.dragStartPoint = null;

        state.activeExpression.selectedShapes = new Set();

        if (!isClick) {
            saveState(state, "Moved shapes");
        }
    }

    if (handler.state.activeExpression.isBoxSelecting) {
        handler.state.activeExpression.isBoxSelecting = false;
        handler.state.activeExpression.boxSelectionBox = state.activeExpression.hoveredShapes.size === 0 ? null : 
            getShapeBoundingBox(handler.state, handler.state.activeExpression.hoveredShapes, 16);

        updateQueryTags(state);
    }
}

function setBoxHover(pos1, pos2, state) {

    const minX = Math.min(pos1.x, pos2.x);
    const minY = Math.min(pos1.y, pos2.y);
    const maxX = Math.max(pos1.x, pos2.x);
    const maxY = Math.max(pos1.y, pos2.y);
    state.activeExpression.boxSelectionBox = {
        minX: minX, 
        minY: minY,
        maxX: maxX,
        maxY: maxY,
    }
    const hoveredShapes = getShapesInBox(state, state.activeExpression.boxSelectionBox);
    const hoveredQueries = getQueriesFromShapes(state, hoveredShapes);
    
    updateBoxHover(state);
    if (state.activeExpression.hoveringType === hoverType.viewport &&
        areSetsEqual(hoveredShapes, state.activeExpression.hoveredShapes) &&
        areSetsEqual(hoveredQueries, state.activeExpression.hoveredQueries))
        return; 
    
    state.activeExpression.boxSelectedShapes = hoveredShapes;
    setHoverFromShapes(state, hoveredShapes, hoverType.viewport);
    updateAll(state);
}

function setPointHover(handler, state) {
    const hoveredShapes = getShapesUnderPoint(handler.mouseViewPos, state);
    const i = toInt(hoveredShapes);

    if (state.activeExpression.hoveredFragments.has(i))
        return;

    setHoverFromFragments(state, new Set([i]), hoverType.viewport);
    updateAll(state);
}

function rightClickDrag(handler, canvas, e) {
    if (!handler.isRightClickDragging)
        return;

    const state = handler.state;
    const currentPoint = { x: e.clientX, y: e.clientY };
    const view = state.activeExpression.activeView;
    const deltaX = currentPoint.x - handler.rightClickDragStartPoint.x;
    const deltaY = currentPoint.y - handler.rightClickDragStartPoint.y;

    view.trans.x += deltaX / view.scale;
    view.trans.y += deltaY / view.scale;

    handler.rightClickDragStartPoint = currentPoint;

    e.preventDefault();
    state.viewport.redrawBackground(state);
    updateAll(state, true, false);
}