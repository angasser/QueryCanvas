import { getShapesUnderPoint, updateViewport } from './viewport.js';
import { initializeUiInput } from './uiDisplay.js';
import { areSetsEqual, getQueriesFromShapes, getShapeBoundingBox, getShapesInBox, toInt } from './util.js';
import { createNewQuery, setHoverFromFragments, setHoverFromShapes, switchViewport, toggleInactiveFragment, updateAll } from './stateManager.js';
import { updateBoxHover, updateQueryTags } from './uiQueryTags.js';
import { hoverType } from './structs.js';

export class InputHandler {
    constructor(viewport, uiDisplay, state) {
        this.state = state;
        this.viewport = viewport;
        this.uiDisplay = uiDisplay;
        this.isDragging = false;
        this.dragStartPoint = null;
        this.dragLastPoint = null;
        initializeInput(this, viewport.mainCanvas, state);
        initializeUiInput(uiDisplay, state);
    }
}


function initializeInput(handler, canvas) {
    const state = handler.state;

    canvas.addEventListener('mousedown', (e) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        if (state.activeState.boxSelectionBox !== null && 
            mouseX >= state.activeState.boxSelectionBox.minX &&
            mouseX <= state.activeState.boxSelectionBox.maxX &&
            mouseY >= state.activeState.boxSelectionBox.minY &&
            mouseY <= state.activeState.boxSelectionBox.maxY
        ) {
            handler.isDragging = true;
            handler.dragStartPoint = { x: mouseX, y: mouseY };
            handler.dragLastPoint = { x: mouseX, y: mouseY };
            state.activeState.selectedShapes = state.activeState.boxSelectedShapes; 
        }
        else if (state.activeState.hoveringType === hoverType.viewport && state.activeState.hoveredQueries.size !== 0) {
            handler.isDragging = true;
            handler.dragStartPoint = { x: mouseX, y: mouseY };
            handler.dragLastPoint = { x: mouseX, y: mouseY };
            state.activeState.selectedShapes = state.activeState.hoveredShapes;
            state.activeState.boxSelectionBox = null;
        }
        else {
            handler.state.activeState.isBoxSelecting = true;
            handler.dragStartPoint = { x: mouseX, y: mouseY };
        }
    });

    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        if (handler.isDragging) {
            const dragOffset = {
                x: mouseX - handler.dragLastPoint.x,
                y: mouseY - handler.dragLastPoint.y,
            }

            handler.dragLastPoint = { x: mouseX, y: mouseY };

            for (const shapeId of state.activeState.selectedShapes) {
                const shape = state.activeState.activeView.shapes.get(shapeId);
                shape.center.x += dragOffset.x;
                shape.center.y += dragOffset.y;
            }

            if (state.activeState.boxSelectionBox !== null) {
                state.activeState.boxSelectionBox.minX += dragOffset.x;
                state.activeState.boxSelectionBox.minY += dragOffset.y;
                state.activeState.boxSelectionBox.maxX += dragOffset.x;
                state.activeState.boxSelectionBox.maxY += dragOffset.y;
            }

            updateAll(state, true);
        }

        if (handler.state.activeState.isBoxSelecting) {
            setBoxHover(handler, mouseX, mouseY, state);
        }
        else {
            setPointHover(mouseX, mouseY, state);
        }
    });

    canvas.addEventListener('mouseup', () => {
        if (handler.isDragging) {
            const tolerance = 4; 
            if (Math.abs(handler.dragStartPoint.x - handler.dragLastPoint.x) <= tolerance &&
                Math.abs(handler.dragStartPoint.y - handler.dragLastPoint.y) <= tolerance) {
                toggleInactiveFragment(handler.state, state.activeState.hoveredShapes);
            }

            handler.isDragging = false;
            handler.dragStartPoint = null;

            state.activeState.selectedShapes = new Set();
        }

        if (handler.state.activeState.isBoxSelecting) {
            handler.state.activeState.isBoxSelecting = false;
            handler.state.activeState.boxSelectionBox = state.activeState.hoveredShapes.size === 0 ? null : 
                getShapeBoundingBox(handler.state, handler.state.activeState.hoveredShapes, 16);

            updateQueryTags(state);
        }
    });

    canvas.addEventListener('dblclick', (e) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const hoveredShapes = getShapesUnderPoint({ x: mouseX, y: mouseY }, state);
        if (hoveredShapes.size === 1) {
            for (const shapeId of hoveredShapes) {
                const shape = state.activeState.activeView.shapes.get(shapeId);
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
    state.activeState.boxSelectionBox = {
        minX: minX, 
        minY: minY,
        maxX: maxX,
        maxY: maxY,
    }
    const hoveredShapes = getShapesInBox(state, state.activeState.boxSelectionBox);
    const hoveredQueries = getQueriesFromShapes(state, hoveredShapes);
    
    updateBoxHover(state);
    if (state.activeState.hoveringType === hoverType.viewport &&
        areSetsEqual(hoveredShapes, state.activeState.hoveredShapes) &&
        areSetsEqual(hoveredQueries, state.activeState.hoveredQueries))
        return; 
    
    state.activeState.boxSelectedShapes = hoveredShapes;
    setHoverFromShapes(state, hoveredShapes, hoverType.viewport);
    updateAll(state);
}

function setPointHover(mouseX, mouseY, state) {
    const hoveredShapes = getShapesUnderPoint({ x: mouseX, y: mouseY }, state);
    const i = toInt(hoveredShapes);
    
    if (state.activeState.hoveredFragments.has(i))
        return;

    setHoverFromFragments(state, new Set([i]), hoverType.viewport);
    updateAll(state);
}