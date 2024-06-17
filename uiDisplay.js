import { itemButton, getShapesFromQuery, setElementInteraction, itemTextButton, areSetsEqual, numberToLetter, darkColor, hexToRgb, getShapesInBox } from './util.js';
import { createNewQuery, removeQuery, createNewShape, removeShape, addNewViewport, switchViewport, removeViewport, updateViewportName, updateAll, setHoverFromShapes } from './stateManager.js';
import { interactionType, shapeType, hoverType } from './structs.js';
import { updateResultTab } from './resultTab.js';
import { updateViewport } from './viewport.js';
import { updateCodeTab } from './codeDisplay.js';

export class UIDisplay {
    constructor() {
        this.queryList = document.querySelector('#queryList');
        this.toolList = document.querySelector('#toolList');
        this.titleList = document.querySelector('#titleList');

        this.queryButton = document.querySelector('#queryButton');
        this.titleButton = document.querySelector('#titleButton');
    }
}

export function updateUi(uiDisplay, state) {
    updateQueryDisplay(uiDisplay, state);
    updateTabBars(uiDisplay, state);
    updateToolTab(uiDisplay, state);
    updateCodeTab(state);
}

export function updateTabBars(uiDisplay, state) {
    const noQueries = state.queries.size <= 1;
    if (noQueries) {
        state.areQueriesVisible = false;
    }

    const visibilityIcon =
        state.areQueriesVisible ? `./svgs/icons8-up-100.png` :
            `./svgs/icons8-down-button-100.png`;

    const buttonText = noQueries ? "Create new Query" : state.areQueriesVisible ? "Queries" : "Show Queries";
    
    uiDisplay.queryButton.innerHTML = `
        <div style="
            display: flex; 
            justify-content: space-between; 
            align-items: center;
            gap: 16px;
            ">
            <img style="visibility: ${noQueries ? "hidden" : "visible"};" src="${visibilityIcon}" alt="Icon" width="48">
            <div id="titleText" style="white-space: pre;">${buttonText}</div>
        </div>
        <div id="addButtons" style="
            display: flex;
            justify-content: space-between;
            gap: 2px";
        ></div>
    `;

    const titleText = document.querySelector('#titleText');
    const addButtons = document.querySelector('#addButtons');

    addButtons.appendChild(itemButton("./svgs/icons8-plus.svg", 48, (event) => {
        event.stopPropagation();
        createNewQuery(state);
    }, () => {
        titleText.innerHTML = "Create new Query";
    }, () => {
        titleText.innerHTML = buttonText;
    }));

    updateTitleButton(uiDisplay, state);
}

export function updateToolTab(uiDisplay, state) {
    if (state.selectedToolTab === null) {
        toggleTabList(uiDisplay.toolList, false);
    }
    else if (state.selectedToolTab === "result") {
        updateResultTab(state, uiDisplay);
    }
}

function updateTitleButton(uiDisplay, state) {
    const selectedQuery = state.selectedQuery;
    uiDisplay.titleButton.innerHTML = "";
    state.selectedQuery = selectedQuery;
    uiDisplay.titleButton.style.position = 'relative'; 

    let selectedId = state.activeView.id;
    let editableId = null;
    if (selectedQuery !== null && selectedQuery.type !== "query") {
        editableId = selectedQuery.id;
        selectedId = selectedQuery.id;
    }

    if (selectedId === 0) {
        uiDisplay.titleButton.style.backgroundColor = "white";
    }
    else {
        const query = state.queries.get(-selectedId);
        uiDisplay.titleButton.style.backgroundColor = query.color;
    }
        
    const titleInput = document.createElement("input");
    titleInput.setAttribute("type", "text");
    titleInput.setAttribute("value", state.viewportStates.get(selectedId).getName());
    titleInput.setAttribute("class", "title-input");
    titleInput.style.width = "calc(100% - 128px)";
    titleInput.style.fontWeight = "bold";


    const addText = document.createElement("div");
    const isBoxSelected = state.boxSelectionBox !== null && state.boxSelectedShapes.size > 0;
    addText.innerHTML = isBoxSelected ? "Create Variable from selection" : "Add new Variable";
    addText.style.fontSize = "24px";
    addText.style.position = "absolute";
    addText.style.zIndex = 500;
    addText.style.left = "72px";
    addText.style.right = "72px";
    addText.style.visibility = "hidden";
    addText.style.pointerEvent = "none";
    
    titleInput.addEventListener('blur', function (event) {
        const val = event.target.value;
        const id = state.selectedQuery === null || state.selectedQuery.type === "query" ? state.activeView.id : state.selectedQuery.id;
        state.selectedQuery = null;
        if (val.length > 0) {
            updateViewportName(state, id, val);
        }
        updateTitleButton(uiDisplay, state);
    });

    titleInput.addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            titleInput.blur();
        }
    });

    const addIcon = isBoxSelected ?  "./svgs/icons8-plus-box.svg" : "./svgs/icons8-plus.svg";
    const addButton = itemButton(addIcon, 48, (event) => {
        if (isBoxSelected) {
            const shapeIds = state.boxSelectedShapes;  //getShapesInBox(state, state.boxSelectionBox);
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
        else {
            addNewViewport(state, false);
        }
    }, () => {
        if (state.selectedQuery === null || state.selectedQuery.type === "query") {
            addText.style.visibility = "visible";
            titleInput.style.visibility = "hidden";
        }
    }, () => {
        addText.style.visibility = "hidden";
        titleInput.style.visibility = "visible";
    });

    const arrowButton = state.isViewportSelectionVisible ? "./svgs/icons8-up-100.png" : "./svgs/icons8-down-button-100.png";
    const toggleButton = itemButton(arrowButton, 48, () => {
        state.isViewportSelectionVisible = !state.isViewportSelectionVisible;
        updateAll(state);
    }, null, null, state.viewportStates.size > 1);


    uiDisplay.titleButton.appendChild(toggleButton);
    uiDisplay.titleButton.appendChild(titleInput);
    uiDisplay.titleButton.appendChild(addButton);
    uiDisplay.titleButton.appendChild(addText);

    toggleTabList(uiDisplay.titleList, state.isViewportSelectionVisible);
    uiDisplay.titleList.innerHTML = '';
    if (state.isViewportSelectionVisible) {
        for (const view of state.viewportStates.values()) {
            addTitleRow(uiDisplay, state, view);
        }
    }

    if (editableId !== null) {
        titleInput.select();
    }
}

function addTitleRow(uiDisplay, state, view) {
    const listItem = document.createElement('div');
    listItem.classList.add('baseButton');
    listItem.style.padding = '8px';
    listItem.style.alignItems = 'center';
    listItem.style.gap = '8px';
    listItem.style.fontSize = '24px';

    
    listItem.appendChild(itemButton("./svgs/icons8-cross.svg", 32, (event) => {
        event.stopPropagation();
        const isConfirmed = confirm("Are you sure you want to remove this variable and viewport?");
        if (isConfirmed) {
            removeViewport(state, view.getId());
        }
    }, null, null, view.id !== 0));
    

    listItem.insertAdjacentHTML('beforeend', getQueryCircle(state, -view.getId(), 32));

    const name = document.createElement('div');
    name.innerHTML = view.getName();
    listItem.appendChild(name);
    uiDisplay.titleList.appendChild(listItem);
    listItem.onclick = function () {
        switchViewport(state, view.getId());
        state.isViewportSelectionVisible = false;
        updateAll(state);
    };

}

export function updateQueryDisplay(uiDisplay, state) {
    toggleTabList(uiDisplay.queryList, state.areQueriesVisible);

    if(!state.areQueriesVisible)
        return;
    
    const selectedQuery = state.selectedQuery;
    uiDisplay.queryList.innerHTML = '';
    state.selectedQuery = selectedQuery;
    for (const query of state.queries.values()) {
        if(-query.id !== state.activeView.id && getShapesFromQuery(state, query.id).size !== 0)
            addQueryRow(uiDisplay, state, query);
    }

    for (const query of state.queries.values()) {
        if(-query.id !== state.activeView.id &&getShapesFromQuery(state, query.id).size === 0)
            addQueryRow(uiDisplay, state, query);
    }    
}

export function addQueryRow(uiDisplay, state, query) {
    const listItem = document.createElement('div');
    listItem.innerHTML = `
        <div id="queryRow"> 
            <div class="row-buttons" style="width: calc((32+4)*4)px; gap: 4px;"> </div>
            <input class="query-content" value="${query.content}" />
            ${getQueryCircle(state, query.id)}
        </div>
        <div class="shape-rows"> 
        </div>
        <hr style="margin: 0">
    `;

    const isDisabled = getShapesFromQuery(state, query.id).size === 0;
    const inputField = listItem.querySelector('.query-content');
    const queryRow = listItem.querySelector('#queryRow');
    queryRow.addEventListener('mouseenter', () => {
        if (isDisabled)
            return;
        const hoveredShapes = getShapesFromQuery(state, query.id);
        if (state.hoveringType !== hoverType.viewport &&
            state.hoveredQueries.size === 1 &&
            state.hoveredQueries.has(query.id) &&
            areSetsEqual(hoveredShapes, state.hoveredShapes))
            return;

        setHoverFromShapes(state, hoveredShapes, hoverType.queryList);
        updateAll(state);
    });

    const rowButtons = listItem.querySelector('.row-buttons');
    const arrowButton = state.visibleQueryShapeRows.has(query.id) ? "./svgs/icons8-up-100.png" : "./svgs/icons8-down-button-100.png";

    rowButtons.appendChild(itemButton(arrowButton, 32, () => {
        if (state.visibleQueryShapeRows.has(query.id)) {
            state.visibleQueryShapeRows.delete(query.id);
        }
        else {
            state.visibleQueryShapeRows.add(query.id);
        }
        updateAll(state);
    }, null, null, getShapesFromQuery(state, query.id).size !== 0));

    rowButtons.appendChild(itemButton("./svgs/icons8-plus.svg", 32, () => {
        createNewShape(state, query.id);
    }, null, null));
    rowButtons.appendChild(itemButton("./svgs/icons8-cross.svg", 32, () => {
        if (query.id <= 0) {
            const isConfirmed = confirm("Are you sure you want to remove this variable and viewport?");
            if (isConfirmed) {
                removeViewport(state, -query.id);
            }
        }
        else {
            const isConfirmed = confirm("Are you sure you want to remove this query?");
            if (isConfirmed) {
                removeQuery(state, query.id);
            }
        }
    }, null, null, query.id !== 0));

    rowButtons.appendChild(itemButton("./svgs/icons8-arrow-100.png", 32, () => {
        switchViewport(state, -query.id);
    }, null, null, query.id <= 0));

    inputField.addEventListener('focus', function (event) {
        event.target.select();
    });

    inputField.addEventListener('blur', function (event) {
        const val = event.target.value;
        if (val.length > 0) {
            if (query.id <= 0) {
                updateViewportName(state, -query.id, val);
            }
            else {
                query.content = val;
            }
        }
        state.selectedQuery = null;
        updateAll(state);
    });

    inputField.addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            inputField.blur();
        }
    });

    if (state.visibleQueryShapeRows.has(query.id)) {
        const rows = listItem.querySelector('.shape-rows');
        const shapes = getShapesFromQuery(state, query.id);
        for (const shape of shapes) 
            addShapeRow(uiDisplay, rows, state, shape);
    }

    uiDisplay.queryList.appendChild(listItem);
    if (state.selectedQuery !== null && state.selectedQuery.type === "query" && state.selectedQuery.id === query.id) {
        setElementInteraction(queryRow, interactionType.Selected);
        inputField.select();
    }
    else if (isDisabled) {
        setElementInteraction(queryRow, interactionType.Disabled)
    }
    else if (state.hoveredQueries.has(query.id)) {
        setElementInteraction(queryRow, interactionType.Highlighted)
    }

    
    
}

function addShapeRow(uiDisplay, queryRow, state, shape) {
    const listItem = document.createElement('div');
    const shapInst = state.activeView.shapes.get(shape);

    listItem.classList.add('queryRow');
    listItem.style.alignItems = 'center';
    listItem.style.display = 'flex';
    listItem.style.padding = '2px';
    listItem.style.paddingLeft = '72px';
    listItem.style.paddingRight = '16px';
    listItem.style.gap = '4px';
    listItem.innerHTML = `
        <div class="row-buttons" style="
            width: 32px;
            gap: 4px;">
        </div>
        <input style="flex-grow: 1;"
            type="range" min="50" max="500" value="${shapInst.radius}" class="slider" id="radius">
    `;

    if (shapInst.shapeType === shapeType.Rectangle) {
        listItem.innerHTML += `
            <input style="flex-grow: 1;"
                type="range" min="50" max="500" value="${shapInst.radius2}" class="slider" id="radius2">
        `;

        const slider2 = listItem.querySelector('#radius2');
        slider2.addEventListener('input', function(event) {
            shapInst.radius2 = parseInt(event.target.value);
            updateViewport(state.viewport, state);
        });
    }

    listItem.addEventListener('mouseenter', () => {
        if (state.hoveringType !== hoverType.viewport &&
            state.hoveredShapes.size === 1 &&
            state.hoveredQueries.size === 1 &&
            state.hoveredShapes.has(shape))
            return;

        setHoverFromShapes(state, new Set([shape]), hoverType.queryList);
        updateAll(state);
    });

    if (state.hoveredShapes.has(shape)) {
        setElementInteraction(listItem, interactionType.Highlighted)
    }

    const rowButtons = listItem.querySelector('.row-buttons');
    rowButtons.appendChild(itemButton("./svgs/icons8-cross.svg", 32, () => {
        const isConfirmed = confirm("Are you sure you want to remove this shape?");
        if (isConfirmed) {
            removeShape(state, shape);
        }
    }, null, null));

    const shapeImg = shapInst.shapeType === shapeType.Circle ? "./svgs/icons8-circle-90.png" :
        shapInst.shapeType === shapeType.Rectangle ? "./svgs/icons8-square-100.png" :
            "./svgs/icons8-rhombus-67.png";
    listItem.appendChild(itemTextButton(shapeImg, "Shape", 32, () => {
        if(shapInst.shapeType === shapeType.Circle) {
            shapInst.shapeType = shapeType.Rectangle;
        }
        else if(shapInst.shapeType === shapeType.Rectangle) {
            shapInst.shapeType = shapeType.Rhombus;
        }
        else {
            shapInst.shapeType = shapeType.Circle;
        }

    updateAll(state);
    }, null, null));


    queryRow.appendChild(listItem);

    const slider = listItem.querySelector('#radius');
    slider.addEventListener('input', function(event) {
        shapInst.radius = parseInt(event.target.value);
        updateViewport(state.viewport, state);
    });
}

export function getQueryCircle(state, queryId, size=48) {
    const query = state.queries.get(queryId);
    const isVariable = queryId <= 0;
    const queryText = isVariable ? numberToLetter(-queryId) : queryId;
    const transform = isVariable ? "transform: rotate(45deg) scale(.75);" : "";
    const invTransform = isVariable ? `transform: rotate(-45deg) scale(1.333) translate(0px, -${3 / 48 * size}px);` : "";
    return `
        <div id="queryCircle" style="
            width: ${size}px;
            height: ${size}px;
            border-radius: ${queryId > 0 ? "50%" : "0"};
            border: 2px solid ${darkColor(hexToRgb(query.color))};
            background-color: ${query.color}; 
            display: flex; 
            justify-content: center; 
            align-items: center;
            font-size: ${size*2/3}px;
            color: white;
            ${transform}
            ">
            <div class="outlinedText" style="
                display: flex;
                justify-content: center;
                align-items: center;
                ${invTransform}
            ">
                ${queryText}
            </div>
        </div>
    `;
}

export function toggleTabList(list, visible) {
    if (!visible) {
        list.innerHTML = '';
        list.style.paddingBottom = '0';
        list.style.visibility = 'hidden';
    }
    else {
        list.style.paddingBottom = '28px';
        list.style.visibility = 'visible';
    }
}
