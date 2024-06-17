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

        if (state.boxSelectionBox !== null && 
            mouseX >= state.boxSelectionBox.minX &&
            mouseX <= state.boxSelectionBox.maxX &&
            mouseY >= state.boxSelectionBox.minY &&
            mouseY <= state.boxSelectionBox.maxY
        ) {
            handler.isDragging = true;
            handler.dragStartPoint = { x: mouseX, y: mouseY };
            handler.dragLastPoint = { x: mouseX, y: mouseY };
            state.selectedShapes = state.boxSelectedShapes; 
        }
        else if (state.hoveringType === hoverType.viewport && state.hoveredQueries.size !== 0) {
            handler.isDragging = true;
            handler.dragStartPoint = { x: mouseX, y: mouseY };
            handler.dragLastPoint = { x: mouseX, y: mouseY };
            state.selectedShapes = state.hoveredShapes;
            state.boxSelectionBox = null;
        }
        else {
            handler.state.isBoxSelecting = true;
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

            for (const shapeId of state.selectedShapes) {
                const shape = state.activeView.shapes.get(shapeId);
                shape.center.x += dragOffset.x;
                shape.center.y += dragOffset.y;
            }

            if (state.boxSelectionBox !== null) {
                state.boxSelectionBox.minX += dragOffset.x;
                state.boxSelectionBox.minY += dragOffset.y;
                state.boxSelectionBox.maxX += dragOffset.x;
                state.boxSelectionBox.maxY += dragOffset.y;
            }

            updateAll(state);
        }

        if (handler.state.isBoxSelecting) {
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
                toggleInactiveFragment(handler.state, state.hoveredShapes);
            }

            handler.isDragging = false;
            handler.dragStartPoint = null;

            state.selectedShapes = new Set();
        }

        if (handler.state.isBoxSelecting) {
            handler.state.isBoxSelecting = false;
            handler.state.boxSelectionBox = state.hoveredShapes.size === 0 ? null : 
                getShapeBoundingBox(handler.state, handler.state.hoveredShapes, 16);

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
                const shape = state.activeView.shapes.get(shapeId);
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
    state.boxSelectionBox = {
        minX: minX, 
        minY: minY,
        maxX: maxX,
        maxY: maxY,
    }
    const hoveredShapes = getShapesInBox(state, state.boxSelectionBox);
    const hoveredQueries = getQueriesFromShapes(state, hoveredShapes);
    
    updateBoxHover(state);
    if (state.hoveringType === hoverType.viewport &&
        areSetsEqual(hoveredShapes, state.hoveredShapes) &&
        areSetsEqual(hoveredQueries, state.hoveredQueries))
        return; 
    
    state.boxSelectedShapes = hoveredShapes;
    setHoverFromShapes(state, hoveredShapes, hoverType.viewport);
    updateAll(state);
}

function setPointHover(mouseX, mouseY, state) {
    const hoveredShapes = getShapesUnderPoint({ x: mouseX, y: mouseY }, state);
    const i = toInt(hoveredShapes);
    
    if (state.hoveredFragments.has(i))
        return;

    setHoverFromFragments(state, new Set([i]), hoverType.viewport);
    updateAll(state);
}