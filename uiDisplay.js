import { itemButton, getShapesFromQuery, setElementInteraction, itemTextButton, areSetsEqual, numberToLetter, darkColor, hexToRgb, getShapesInBox } from './util.js';
import { createNewQuery, removeQuery, createNewShape, removeShape, addNewViewport, switchViewport, removeViewport, updateViewportName, updateAll, setHoverFromShapes, createViewportFromShapes } from './stateManager.js';
import { interactionType, shapeType, hoverType, toToolType, toolType } from './structs.js';
import { updateResultTab } from './resultTab.js';
import { updateViewport } from './viewport.js';
import { updateCodeTab } from './codeDisplay.js';
import { updateHelpTab } from './helpTab.js';

export class UIDisplay {
    constructor() {
        this.queryList = document.querySelector('#queryList');
        this.resultTab = document.querySelector('#resultTab');
        this.helpTab = document.querySelector('#helpTab');
        this.titleList = document.querySelector('#titleList');

        this.queryBar = document.querySelector('#queryBar');
        this.titleBar = document.querySelector('#titleBar');
        this.toolBar = document.querySelector('#toolBar');
        
        this.queryToggle = document.querySelector('#queryToggle');
        this.queryTitleText = document.querySelector('#queryTitleText');
        this.queryAddButton = document.querySelector('#queryAddButton');

        this.titleInput = document.querySelector('#titleInput');
        this.titleOverwrite = document.querySelector('#titleOverwrite');
        this.titleAddButton = document.querySelector('#titleAddButton');
        this.titleToggle = document.querySelector('#titleToggle');

        this.isDirty = false;
    }
} 

export function updateUi(uiDisplay, state) {
    uiDisplay.isDirty = false;
    updateQueryBar(uiDisplay, state);
    updateQueryDisplay(uiDisplay, state);


    updateTitleBar(uiDisplay, state);

    updateToolBar(uiDisplay, state);
}

export function initializeUiInput(uiDisplay, state) {
        
    setInterval(() => {
        if(uiDisplay.isDirty)
            updateUi(uiDisplay, state);
    }, 200);
    
    // query bar
    uiDisplay.queryBar.addEventListener('click', () => {
        if (state.queries.size === 1) {
            createNewQuery(state);
            return;
        }
        state.areQueriesVisible = !state.areQueriesVisible;
        updateAll(state);
    });

    // title bar
    uiDisplay.titleInput.addEventListener('blur', function (event) {
        const val = event.target.value;

        const id = state.selectedQuery === null || state.selectedQuery.type === "query" ? state.activeView.id : state.selectedQuery.id;
        state.selectedQuery = null;
        if (val.length > 0) {
            updateViewportName(state, id, val);
        }
        updateTitleBar(uiDisplay, state);
    });

    uiDisplay.titleInput.addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            titleInput.blur();
        }
    });

    

    // tool bar
    for (let i = 0; i < uiDisplay.toolBar.children.length; i++) {
        const button = uiDisplay.toolBar.children[i];

        button.addEventListener('click', () => {
            const tab = toToolType(i);
            if (state.selectedToolTab === tab) {
                state.selectedToolTab = toolType.none;
                updateAll(state);
                return;
            }
            state.selectedToolTab = tab;
            updateAll(state);
        });
    }
}


export function updateQueryBar(uiDisplay, state) {
    const noQueries = state.queries.size <= 1 || (state.queries.size === 2 && state.viewportStates.size > 1 && state.activeView.id !== 0);
    if (noQueries) {
        state.areQueriesVisible = false;
    }

    const visibilityIcon =
        state.areQueriesVisible ? `./svgs/icons8-up-100.png` :
            `./svgs/icons8-down-button-100.png`;

    const queryToggle = `<img style="visibility: ${noQueries ? "hidden" : "visible"};" src="${visibilityIcon}" alt="Icon" width="48">`;
    uiDisplay.queryToggle.innerHTML = queryToggle;

    const buttonText = noQueries ? "Create new Query" : state.areQueriesVisible ? "Queries" : "Show Queries";
    uiDisplay.queryTitleText.innerHTML = buttonText;

    uiDisplay.queryAddButton.innerHTML = '';
    uiDisplay.queryAddButton.appendChild(itemButton("./svgs/icons8-plus.svg", 48, (event) => {
        event.stopPropagation();
        createNewQuery(state);
    }, () => {
        uiDisplay.queryTitleText.innerHTML = "Create new Query";
    }, () => {
        uiDisplay.queryTitleText.innerHTML = buttonText;
    }));
}

export function updateToolBar(uiDisplay, state) {
    for (let i = 0; i < uiDisplay.toolBar.children.length; i++) {
        const button = uiDisplay.toolBar.children[i];
        if (state.selectedToolTab === i) {
            setElementInteraction(button, interactionType.Selected);
        }
        else {
            setElementInteraction(button, interactionType.None);
        }

        if (i === toolType.result) {
            const disabled = state.activeView.shapes.size === 0;
            button.disabled = disabled;
            if(disabled) {
                setElementInteraction(button, interactionType.Disabled);
            }
        }
    }

    updateResultTab(state, uiDisplay);
    updateHelpTab(state, uiDisplay);
    updateCodeTab(state, uiDisplay);
}

function updateTitleBar(uiDisplay, state) {
    // When destroying elements, selectedQuery may be set to null (through unhover listeners)
    const selectedQuery = state.selectedQuery;
    uiDisplay.titleAddButton.innerHTML = '';
    uiDisplay.titleToggle.innerHTML = '';
    uiDisplay.titleList.innerHTML = '';
    state.selectedQuery = selectedQuery;
    // uiDisplay.titleBar.style.position = 'relative';

    
    
    let selectedId = state.activeView.id;
    let editableId = null;
    if (selectedQuery !== null && selectedQuery.type !== "query") {
        editableId = selectedQuery.id;
        selectedId = selectedQuery.id;
    }

    if (selectedId === 0) {
        uiDisplay.titleBar.style.backgroundColor = "white";
    }
    else {
        const query = state.queries.get(-selectedId);
        uiDisplay.titleBar.style.backgroundColor = query.color;
    }
        
    const titleInput = uiDisplay.titleInput;
    titleInput.setAttribute("value", state.viewportStates.get(selectedId).getName());

    const isBoxSelected = state.boxSelectionBox !== null && state.boxSelectedShapes.size > 0;
    uiDisplay.titleOverwrite.innerHTML = isBoxSelected ? "Create Variable from selection" : "Add new Variable";
    uiDisplay.titleOverwrite.style.visibility = "hidden";
    uiDisplay.titleInput.style.visibility = "visible";
    
    const addIcon = isBoxSelected ?  "./svgs/icons8-plus-box.svg" : "./svgs/icons8-plus.svg";
    const addButton = itemButton(addIcon, 48, (event) => {
        if (isBoxSelected) {
            const shapeIds = state.boxSelectedShapes;  //getShapesInBox(state, state.boxSelectionBox);
            createViewportFromShapes(state, shapeIds);
        }
        else {
            addNewViewport(state, false);
        }
    }, () => {
        if (state.selectedQuery === null || state.selectedQuery.type === "query") {
            uiDisplay.titleOverwrite.style.visibility = "visible";
            uiDisplay.titleInput.style.visibility = "hidden";
        }
    }, () => {
        uiDisplay.titleOverwrite.style.visibility = "hidden";
        uiDisplay.titleInput.style.visibility = "visible";
    });

    uiDisplay.titleAddButton.appendChild(addButton);

    const arrowButton = state.isViewportSelectionVisible ? "./svgs/icons8-up-100.png" : "./svgs/icons8-down-button-100.png";
    const toggleButton = itemButton(arrowButton, 48, () => {
        state.isViewportSelectionVisible = !state.isViewportSelectionVisible;
        updateAll(state);
    }, null, null, state.viewportStates.size > 1);

    uiDisplay.titleToggle.appendChild(toggleButton);

    toggleTabList(uiDisplay.titleList, state.isViewportSelectionVisible);
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
    uiDisplay.queryList.innerHTML = '';

    if (!state.areQueriesVisible) 
        return;
    
    const selectedQuery = state.selectedQuery;
    state.selectedQuery = selectedQuery;
    for (const query of state.queries.values()) {
        if(-query.id !== state.activeView.id && getShapesFromQuery(state, query.id).size !== 0)
            addQueryRow(uiDisplay, state, query);
    }

    for (const query of state.queries.values()) {
        if(query.id !== 0 && -query.id !== state.activeView.id &&getShapesFromQuery(state, query.id).size === 0)
            addQueryRow(uiDisplay, state, query);
    }    
}

export function addQueryRow(uiDisplay, state, query) {
    const listItem = document.createElement('div');

    listItem.innerHTML = `
        <div id="queryRow">
            
        </div>
        <div class="shape-rows"> 
        </div>
        <hr style="margin: 0">
    `;

    const queryRow = listItem.querySelector('#queryRow');
    createQueryEditButtons(state, query, queryRow);

    const inputField = createQueryInputField(state, query, queryRow);
    
    const iconWrap = document.createElement('div');
    iconWrap.className = 'centerWrap';
    iconWrap.innerHTML = getQueryCircle(state, query.id);
    queryRow.appendChild(iconWrap);

    const isDisabled = getShapesFromQuery(state, query.id).size === 0;

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


    // Shape rows
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
        console.log("sssss");
    }
    else if (isDisabled) {
        setElementInteraction(queryRow, interactionType.Disabled)
    }
    else if (state.hoveredQueries.has(query.id)) {
        setElementInteraction(queryRow, interactionType.Highlighted)
    }
}

function createQueryEditButtons(state, query, row) {
    const arrowButton = state.visibleQueryShapeRows.has(query.id) ? "./svgs/icons8-up-100.png" : "./svgs/icons8-down-button-100.png";

    row.appendChild(itemButton(arrowButton, 32, () => {
        if (state.visibleQueryShapeRows.has(query.id)) {
            state.visibleQueryShapeRows.delete(query.id);
        }
        else {
            state.visibleQueryShapeRows.add(query.id);
        }
        updateAll(state);
    }, null, null, getShapesFromQuery(state, query.id).size !== 0));

    row.appendChild(itemButton("./svgs/icons8-plus.svg", 32, () => {
        createNewShape(state, query.id);
    }, null, null));
    row.appendChild(itemButton("./svgs/icons8-cross.svg", 32, () => {
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

    row.appendChild(itemButton("./svgs/icons8-arrow-100.png", 32, () => {
        switchViewport(state, -query.id);
    }, null, null, query.id <= 0));
}

function createQueryInputField(state, query, row) {
    const inputField = document.createElement('input');
    inputField.className = 'query-content';
    inputField.value = query.content;
    row.appendChild(inputField);

    
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
    
    inputField.addEventListener('focus', function (event) {
        event.target.select();
    });

    return inputField;
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
        <input style="flex-grow: 1; width: 32px;"
            type="range" min="50" max="500" value="${shapInst.radius}" class="slider" id="radius">
    `;

    if (shapInst.shapeType === shapeType.Rectangle) {
        listItem.innerHTML += `
            <input style="flex-grow: 1; width: 32px;"
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
        // list.innerHTML = '';
        list.style.paddingBottom = '0';
        list.style.visibility = 'hidden';
    }
    else {
        list.style.paddingBottom = '28px';
        list.style.visibility = 'visible';
    }
}
