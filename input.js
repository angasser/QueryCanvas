import { getShapesUnderPoint, updateViewport } from './viewport.js';
import { initializeUiInput } from './uiDisplay.js';
import { areSetsEqual, getQueriesFromShapes, getShapeBoundingBox, getShapesInBox, toInt } from './util.js';
import { setHoverFromFragments, setHoverFromShapes, switchViewport, toggleInactiveFragment, updateAll } from './stateManager.js';
import { updateBoxHover, updateQueryTags } from './uiQueryTags.js';
import { hoverType } from './structs.js';
import { initialzeCodeInput } from './codeDisplay.js';

export class InputHandler {
    constructor(state) {
        this.state = state;
        this.viewport = state.viewport;
        this.uiDisplay = state.uiDisplay;
        this.isDragging = false;
        this.dragStartPoint = null;
        this.dragLastPoint = null;
        initializeInput(this, state.viewport.mainCanvas, state);
        initializeUiInput(state.uiDisplay, state);
        initialzeCodeInput(state, state.codeDisplay);
    }
}


function initializeInput(handler, canvas) {
    const state = handler.state;

    canvas.addEventListener('mousedown', (e) => {
        if (!state.hasExp())
            return;

        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        if (state.activeExpression.boxSelectionBox !== null && 
            mouseX >= state.activeExpression.boxSelectionBox.minX &&
            mouseX <= state.activeExpression.boxSelectionBox.maxX &&
            mouseY >= state.activeExpression.boxSelectionBox.minY &&
            mouseY <= state.activeExpression.boxSelectionBox.maxY
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
    });

    canvas.addEventListener('mousemove', (e) => {
        if (!state.hasExp())
            return;

        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        if (handler.isDragging) {
            const dragOffset = {
                x: mouseX - handler.dragLastPoint.x,
                y: mouseY - handler.dragLastPoint.y,
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
            setBoxHover(handler, mouseX, mouseY, state);
        }
        else {
            setPointHover(mouseX, mouseY, state);
        }
    });

    canvas.addEventListener('mouseup', () => {
        if (!state.hasExp())
            return;

        if (handler.isDragging) {
            const tolerance = 4; 
            if (Math.abs(handler.dragStartPoint.x - handler.dragLastPoint.x) <= tolerance &&
                Math.abs(handler.dragStartPoint.y - handler.dragLastPoint.y) <= tolerance) {
                toggleInactiveFragment(handler.state, state.activeExpression.hoveredShapes);
            }

            handler.isDragging = false;
            handler.dragStartPoint = null;

            state.activeExpression.selectedShapes = new Set();
        }

        if (handler.state.activeExpression.isBoxSelecting) {
            handler.state.activeExpression.isBoxSelecting = false;
            handler.state.activeExpression.boxSelectionBox = state.activeExpression.hoveredShapes.size === 0 ? null : 
                getShapeBoundingBox(handler.state, handler.state.activeExpression.hoveredShapes, 16);

            updateQueryTags(state);
        }
    });

    canvas.addEventListener('dblclick', (e) => {
        if (!state.hasExp())
            return;

        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const hoveredShapes = getShapesUnderPoint({ x: mouseX, y: mouseY }, state);
        if (hoveredShapes.size === 1) {
            for (const shapeId of hoveredShapes) {
                const shape = state.activeExpression.activeView.shapes.get(shapeId);
                if (shape.queryId <= 0) {
                    switchViewport(state, -shape.queryId);
                }
            }
        }
    });
}

function setBoxHover(handler, mouseX, mouseY, state) {
    const minX = Math.min(handler.dragStartPoint.x, mouseX);
    const minY = Math.min(handler.dragStartPoint.y, mouseY);
    const maxX = Math.max(handler.dragStartPoint.x, mouseX);
    const maxY = Math.max(handler.dragStartPoint.y, mouseY);
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

function setPointHover(mouseX, mouseY, state) {
    const hoveredShapes = getShapesUnderPoint({ x: mouseX, y: mouseY }, state);
    const i = toInt(hoveredShapes);
    
    if (state.activeExpression.hoveredFragments.has(i))
        return;

    setHoverFromFragments(state, new Set([i]), hoverType.viewport);
    updateAll(state);
}