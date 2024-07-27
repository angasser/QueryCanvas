import { itemButton, getShapesFromQuery, setElementInteraction, itemTextButton, areSetsEqual, numberToLetter, darkColor, hexToRgb, getShapesInBox } from './util.js';
import { createNewQuery, removeQuery, createNewShape, removeShape, addNewViewport, switchViewport, removeViewport, updateViewportName, updateAll, setHoverFromShapes, createViewportFromShapes, switchExpression, undoState, redoState, saveState } from './stateManager.js';
import { interactionType, shapeType, hoverType, toToolType, toolType, modifyMode } from './structs.js';
import { updateResultTab } from './resultTab.js';
import { updateViewport } from './viewport.js';
import { updateCodeTab } from './codeDisplay.js';
import { updateHelpTab } from './helpTab.js';
import { updateMenuTab } from './menuTab.js';

export class UIDisplay {
    constructor() {
        this.queryList = document.querySelector('#queryList');
        this.resultTab = document.querySelector('#resultTab');
        this.helpTab = document.querySelector('#helpTab');
        this.menuTab = document.querySelector('#menuTab');
        this.titleList = document.querySelector('#titleList');

        this.menuButton = document.querySelector('#menuButton');
        this.helpButton = document.querySelector('#helpButton');
        this.undoButton = document.querySelector('#undoButton');    
        this.redoButton = document.querySelector('#redoButton');
        this.codeButton = document.querySelector('#codeButton');
        this.resultButton = document.querySelector('#resultButton');
        this.toolTitle = document.querySelector("#toolTitle");
        this.toolSelectButtons = [this.menuButton, this.helpButton, this.codeButton, this.resultButton];

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

        this.queryTagRef = document.querySelector('#queryTags');
        this.boundingBoxRef = document.querySelector('#boundingBox');


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


    // Dev tab
    const checkbox = document.getElementById('toggleCheckbox');
    checkbox.checked = true;
    checkbox.addEventListener('change', function () {
        if (this.checked) {
            state.modifyMode = modifyMode.QueryOnly;
            if(state.activeTask.expressions.has(0))
                switchExpression(state, state.activeTask.expressions.get(0));
        } else {
            state.modifyMode = modifyMode.CodeOnly;
            switchExpression(state, null);
        }

    });
    
    // query bar
    uiDisplay.queryBar.addEventListener('click', () => {
        if (state.activeExpression.queries.size === 1) {
            createNewQuery(state, state.activeExpression);
            return;
        }
        state.activeExpression.areQueriesVisible = !state.activeExpression.areQueriesVisible;
        updateAll(state);
    });

    // title bar
    uiDisplay.titleInput.addEventListener('blur', function (event) {
        const val = event.target.value;

        const id = state.activeExpression.selectedQuery === null || state.activeExpression.selectedQuery.type === "query" ? state.activeExpression.activeView.id : state.activeExpression.selectedQuery.id;
        state.activeExpression.selectedQuery = null;
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
    for (let i = 0; i < uiDisplay.toolSelectButtons.length; i++) {
        const button = uiDisplay.toolSelectButtons[i];

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

        button.addEventListener('mouseover', () => {
            const tab = toToolType(i);
            setToolTabTitle(uiDisplay, getToolTabBaseTitle(state, tab));
        });

        button.addEventListener('mouseout', () => {
            setToolTabTitle(uiDisplay, getToolTabBaseTitle(state));
        });
    }

    function updateUndoHover(){
        if(state.undoStack.length <= 1)
            setToolTabTitle(uiDisplay, "");
        else
            setToolTabTitle(uiDisplay, "Undo: " + state.undoStack[state.undoStack.length - 1].tooltip);
    }

    uiDisplay.undoButton.addEventListener('click', () => {
        undoState(state);
        updateUndoHover();
    });
    uiDisplay.undoButton.addEventListener('mouseover', () => {
        updateUndoHover();
    });
    uiDisplay.undoButton.addEventListener('mouseout', () => {
        setToolTabTitle(uiDisplay, getToolTabBaseTitle(state));
    });

    function updateRedoHover() {
        if(state.redoStack.length < 1)
            setToolTabTitle(uiDisplay, "");
        else
            setToolTabTitle(uiDisplay, "Redo: " + state.redoStack[state.redoStack.length - 1].tooltip);
    }
    
    uiDisplay.redoButton.addEventListener('click', () => {
        redoState(state);
        updateRedoHover();
    });
    uiDisplay.redoButton.addEventListener('mouseover', () => {
        updateRedoHover();
    });
    uiDisplay.redoButton.addEventListener('mouseout', () => {
        setToolTabTitle(uiDisplay, getToolTabBaseTitle(state));
    });
}


export function updateQueryBar(uiDisplay, state) {
    uiDisplay.queryAddButton.innerHTML = '';
    toggleVisiblity(uiDisplay.queryBar, state.hasExp());
    uiDisplay.queryToggle.innerHTML = "";

    if (!state.hasExp())
        return;

    const noQueries = !hasQueries(state);
    if (noQueries) {
        state.activeExpression.areQueriesVisible = false;
    }

    const visibilityIcon =
        state.activeExpression.areQueriesVisible ? `./svgs/icons8-up-100.png` :
            `./svgs/icons8-down-button-100.png`;

    const queryToggle = `<img style="visibility: ${noQueries ? "hidden" : "visible"};" src="${visibilityIcon}" alt="Icon" width="48">`;
    uiDisplay.queryToggle.innerHTML = queryToggle;

    const buttonText = getQueryTabBaseTitle(state);
    uiDisplay.queryTitleText.innerHTML = buttonText;

    uiDisplay.queryAddButton.appendChild(itemButton("./svgs/icons8-plus.svg", 48, (event) => {
        event.stopPropagation();
        createNewQuery(state, state.activeExpression);
    }, () => {
        uiDisplay.queryTitleText.innerHTML = "Create new Query";
    }, () => {
        uiDisplay.queryTitleText.innerHTML = buttonText;
    }, true, "Create new Query"));
}

function hasQueries(state) {
    return state.activeExpression.queries.size > 2 || (state.activeExpression.queries.size === 2 && (state.activeExpression.viewportStates.size === 1 || state.activeExpression.activeView.id === 0));
}

function getQueryTabBaseTitle(state) {
    return !hasQueries(state) ? "Create new Query" : state.activeExpression.areQueriesVisible ? "Queries" : "Show Queries";
}

function getToolTabBaseTitle(state, tool = null) {
    const t = tool === null ? state.selectedToolTab : tool;
    return t === toolType.result ? "Result view" :
        t === toolType.code ? "Code editor" :
            t === toolType.help ? "Tutorial" :
                t === toolType.menu ? "Menu" :
                    "";
}

function setToolTabTitle(uiDisplay, content){
    uiDisplay.toolTitle.innerHTML = content;
}

export function updateToolBar(uiDisplay, state) {
    for (let i = 0; i < uiDisplay.toolSelectButtons.length; i++) {
        const button = uiDisplay.toolSelectButtons[i];
        if (state.selectedToolTab === i) {
            setElementInteraction(button, interactionType.Selected);
        }
        else {
            setElementInteraction(button, interactionType.None);
        }

        if (i === toolType.result) {
            const disabled = !state.hasExp() || state.activeExpression.activeView.shapes.size === 0;
            button.disabled = disabled;
            if(disabled) {
                setElementInteraction(button, interactionType.Disabled);
            }
        }
    }

    setElementInteraction(uiDisplay.undoButton, state.undoStack.length > 1 ? interactionType.None : interactionType.Disabled);
    setElementInteraction(uiDisplay.redoButton, state.redoStack.length > 0 ? interactionType.None : interactionType.Disabled);

    updateResultTab(state, uiDisplay);
    updateHelpTab(state, uiDisplay);
    updateCodeTab(state, state.codeDisplay);
    updateMenuTab(state, uiDisplay);
}

function updateTitleBar(uiDisplay, state) {
    // When destroying elements, selectedQuery may be set to null (through unhover listeners)
    uiDisplay.titleAddButton.innerHTML = '';
    uiDisplay.titleToggle.innerHTML = '';
    uiDisplay.titleList.innerHTML = '';

    if (!state.hasExp()) {
        toggleTabList(uiDisplay.titleList, false);

        uiDisplay.titleOverwrite.innerHTML = state.modifyMode === modifyMode.CodeOnly ? "Textual code only" : "Select a boolean expression";
        uiDisplay.titleOverwrite.style.visibility = "visible";
        uiDisplay.titleInput.style.visibility = "hidden";
        return;
    }

    const selectedQuery = state.activeExpression.selectedQuery;
    state.activeExpression.selectedQuery = selectedQuery;
    // uiDisplay.titleBar.style.position = 'relative';

    
    
    let selectedId = state.activeExpression.activeView.id;
    let editableId = null;
    if (selectedQuery !== null && selectedQuery.type !== "query") {
        editableId = selectedQuery.id;
        selectedId = selectedQuery.id;
    }

    if (selectedId === 0) {
        uiDisplay.titleBar.style.backgroundColor = "white";
    }
    else {
        const query = state.activeExpression.queries.get(-selectedId);
        uiDisplay.titleBar.style.backgroundColor = query.color;
    }
        
    const titleInput = uiDisplay.titleInput;
    titleInput.value = state.activeExpression.viewportStates.get(selectedId).name;

    const isBoxSelected = state.activeExpression.boxSelectionBox !== null && state.activeExpression.boxSelectedShapes.size > 0;
    uiDisplay.titleOverwrite.innerHTML = isBoxSelected ? "Create Variable from selection" : "Add new Variable";
    uiDisplay.titleOverwrite.style.visibility = "hidden";
    uiDisplay.titleInput.style.visibility = "visible";
    
    const addIcon = isBoxSelected ?  "./svgs/icons8-plus-box.svg" : "./svgs/icons8-plus.svg";
    const addButton = itemButton(addIcon, 48, (event) => {
        if (isBoxSelected) {
            const shapeIds = state.activeExpression.boxSelectedShapes;  
            createViewportFromShapes(state, shapeIds);
        }
        else {
            addNewViewport(state, false);
        }
    }, () => {
        if (state.activeExpression.selectedQuery === null || state.activeExpression.selectedQuery.type === "query") {
            uiDisplay.titleOverwrite.style.visibility = "visible";
            uiDisplay.titleInput.style.visibility = "hidden";
        }
    }, () => {
        uiDisplay.titleOverwrite.style.visibility = "hidden";
        uiDisplay.titleInput.style.visibility = "visible";
    }, true, isBoxSelected ? "Create Variable from selection" : "Add new Variable");

    uiDisplay.titleAddButton.appendChild(addButton);

    const isBackButton = state.activeExpression.activeView.id !== 0;
    const arrowButton = isBackButton ? "./svgs/icons8-back-100.png" :
        state.activeExpression.isViewportSelectionVisible ? "./svgs/icons8-up-100.png" : "./svgs/icons8-down-button-100.png";
    const toggleButton = itemButton(arrowButton, 48, () => {
        if (isBackButton) {
            switchViewport(state, 0);
        }
        else {
            state.activeExpression.isViewportSelectionVisible = !state.activeExpression.isViewportSelectionVisible;
        }
        updateAll(state);
    }, null, null, state.activeExpression.viewportStates.size > 1,
        isBackButton ? "Bach to main viewport" : "Toggle viewports");

    uiDisplay.titleToggle.appendChild(toggleButton);

    toggleTabList(uiDisplay.titleList, state.activeExpression.isViewportSelectionVisible);
    if (state.activeExpression.isViewportSelectionVisible) {
        for (const view of state.activeExpression.viewportStates.values()) {
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
            removeViewport(state, view.id);
        }
    }, null, null, view.id !== 0, "Remove variable and viewport"));
    

    listItem.insertAdjacentHTML('beforeend', getQueryCircle(state, -view.id, 32));

    const name = document.createElement('div');
    name.innerHTML = view.name;
    listItem.appendChild(name);
    uiDisplay.titleList.appendChild(listItem);
    listItem.onclick = function () {
        switchViewport(state, view.id);
        state.activeExpression.isViewportSelectionVisible = false;
        updateAll(state);
    };

}

export function updateQueryDisplay(uiDisplay, state) {
    uiDisplay.queryList.innerHTML = '';

    if (!state.hasExp() || !state.activeExpression.areQueriesVisible) {
        toggleTabList(uiDisplay.queryList, false);
        return;
    }

    toggleTabList(uiDisplay.queryList, state.activeExpression.areQueriesVisible);
    
    const selectedQuery = state.activeExpression.selectedQuery;
    state.activeExpression.selectedQuery = selectedQuery;
    for (const query of state.activeExpression.queries.values()) {
        if(-query.id !== state.activeExpression.activeView.id && getShapesFromQuery(state.activeExpression.activeView, query.id).size !== 0)
            addQueryRow(uiDisplay, state, query);
    }

    for (const query of state.activeExpression.queries.values()) {
        if(query.id !== 0 && -query.id !== state.activeExpression.activeView.id &&getShapesFromQuery(state.activeExpression.activeView, query.id).size === 0)
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

    const isDisabled = getShapesFromQuery(state.activeExpression.activeView, query.id).size === 0;

    queryRow.addEventListener('mouseenter', () => {
        if (isDisabled)
            return;
        const hoveredShapes = getShapesFromQuery(state.activeExpression.activeView, query.id);
        if (state.activeExpression.hoveringType !== hoverType.viewport &&
            state.activeExpression.hoveredQueries.size === 1 &&
            state.activeExpression.hoveredQueries.has(query.id) &&
            areSetsEqual(hoveredShapes, state.activeExpression.hoveredShapes))
            return;

        setHoverFromShapes(state, hoveredShapes, hoverType.queryList);
        updateAll(state);
    });


    // Shape rows
    if (state.activeExpression.visibleQueryShapeRows.has(query.id)) {
        const rows = listItem.querySelector('.shape-rows');
        const shapes = getShapesFromQuery(state.activeExpression.activeView, query.id);
        for (const shape of shapes) 
            addShapeRow(uiDisplay, rows, state, shape);
    }

    uiDisplay.queryList.appendChild(listItem);

    
    if (state.activeExpression.selectedQuery !== null && state.activeExpression.selectedQuery.type === "query" && state.activeExpression.selectedQuery.id === query.id) {
        setElementInteraction(queryRow, interactionType.Selected);
        inputField.select();
    }
    else if (isDisabled) {
        setElementInteraction(queryRow, interactionType.Disabled)
    }
    else if (state.activeExpression.hoveredQueries.has(query.id)) {
        setElementInteraction(queryRow, interactionType.Highlighted)
    }
}

function createQueryEditButtons(state, query, row) {
    const arrowButton = state.activeExpression.visibleQueryShapeRows.has(query.id) ? "./svgs/icons8-up-100.png" : "./svgs/icons8-down-button-100.png";

    row.appendChild(itemButton(arrowButton, 32, () => {
        if (state.activeExpression.visibleQueryShapeRows.has(query.id)) {
            state.activeExpression.visibleQueryShapeRows.delete(query.id);
        }
        else {
            state.activeExpression.visibleQueryShapeRows.add(query.id);
        }
        updateAll(state);
    }, () => {
        state.uiDisplay.queryTitleText.innerHTML = "Toggle shapes";
    }, () => {
        state.uiDisplay.queryTitleText.innerHTML = getQueryTabBaseTitle(state);
    }, getShapesFromQuery(state.activeExpression.activeView, query.id).size !== 0, "Toggle shapes"));

    row.appendChild(itemButton("./svgs/icons8-plus.svg", 32, () => {
        createNewShape(state, query.id);
    }, () => {
        state.uiDisplay.queryTitleText.innerHTML = "Add new Shape";
    }, () => {
        state.uiDisplay.queryTitleText.innerHTML = getQueryTabBaseTitle(state);
    }, true, "Add new Shape to viewport"));
        
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
    }, () => {
        state.uiDisplay.queryTitleText.innerHTML = "Delete Query";
    }, () => {
        state.uiDisplay.queryTitleText.innerHTML = getQueryTabBaseTitle(state);
    }, query.id !== 0, "Delete Query" ));

    row.appendChild(itemButton("./svgs/icons8-arrow-100.png", 32, () => {
        switchViewport(state, -query.id);
    }, () => {
        state.uiDisplay.queryTitleText.innerHTML = "Open Variable";
    }, () => {
        state.uiDisplay.queryTitleText.innerHTML = getQueryTabBaseTitle(state);
    }, query.id <= 0, "Open Variable in viewport"));
}

function createQueryInputField(state, query, row) {
    const inputField = document.createElement('input');
    inputField.className = 'query-content';
    inputField.value = query.content;
    row.appendChild(inputField);

    
    inputField.addEventListener('blur', function (event) {
        const val = event.target.value;
        const oldName = query.content;
        if (val.length > 0) {
            if (query.id <= 0) {
                updateViewportName(state, -query.id, val);
            }
            else {
                query.content = val;
            }
        }
        state.activeExpression.selectedQuery = null;

        if (oldName !== query.content)
            saveState(state, "Changed query name from " + oldName + " to " + query.content);
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
    const shapInst = state.activeExpression.activeView.shapes.get(shape);

    listItem.classList.add('queryRow');
    listItem.style.alignItems = 'center';
    listItem.style.display = 'flex';
    listItem.style.padding = '2px';
    listItem.style.paddingLeft = '48px';
    listItem.style.paddingRight = '16px';
    listItem.style.gap = '4px';
    listItem.innerHTML = `
        <div class="row-buttons" style="
            width: 66px;
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
        slider2.addEventListener('blur', function(event) {
            saveState(state, "Changed shape size");
        });
    }

    listItem.addEventListener('mouseenter', () => {
        if (state.activeExpression.hoveringType !== hoverType.viewport &&
            state.activeExpression.hoveredShapes.size === 1 &&
            state.activeExpression.hoveredQueries.size === 1 &&
            state.activeExpression.hoveredShapes.has(shape))
            return;

        setHoverFromShapes(state, new Set([shape]), hoverType.queryList);
        updateAll(state);
    });

    if (state.activeExpression.hoveredShapes.has(shape)) {
        setElementInteraction(listItem, interactionType.Highlighted)
    }

    const rowButtons = listItem.querySelector('.row-buttons');
    rowButtons.appendChild(itemButton("./svgs/icons8-find-100.png", 32, () => {
        const view = state.activeExpression.activeView;
        view.scale = 1;
        view.trans = {
            x: -(shapInst.center.x - window.innerWidth / 2) + 180,
            y: -(shapInst.center.y - window.innerHeight / 2)
        };
        
        state.viewport.redrawBackground(state);
        updateAll(state);
    }, () => {
        state.uiDisplay.queryTitleText.innerHTML = "Find Shape";
    }, () => {
        state.uiDisplay.queryTitleText.innerHTML = getQueryTabBaseTitle(state);
    }, true, "Move to the shape in the viewport"));
    
    rowButtons.appendChild(itemButton("./svgs/icons8-cross.svg", 32, () => {
        const isConfirmed = confirm("Are you sure you want to remove this shape?");
        if (isConfirmed) {
            removeShape(state, shape);
        }
    }, () => {
        state.uiDisplay.queryTitleText.innerHTML = "Remove Shape";
    }, () => {
        state.uiDisplay.queryTitleText.innerHTML = getQueryTabBaseTitle(state);
    }, true, "Remove Shape from viewport"));

    const shapeImg = shapInst.shapeType === shapeType.Circle ? "./svgs/circle-90.png" :
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
        saveState(state, "Changed shape type");
        updateAll(state);
    }, null, null, "Change shape type"));


    queryRow.appendChild(listItem);

    const slider = listItem.querySelector('#radius');
    slider.addEventListener('input', function(event) {
        shapInst.radius = parseInt(event.target.value);

        updateViewport(state.viewport, state);
    });
    slider.addEventListener('blur', function(event) {
        saveState(state, "Changed shape size");
    });
}

export function getQueryCircle(state, queryId, size=48) {
    const query = state.activeExpression.queries.get(queryId);
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

export function drawCanvasQueryCircle(c, query, pos, scale) {
    const isVariable = query.id <= 0;
    const queryText = isVariable ? numberToLetter(-query.id) : query.id;

    if (isVariable) {
        const sideLength = scale * 36; 
        c.save();
        c.translate(pos.x, pos.y); 
        c.rotate(45 * Math.PI / 180);
        c.beginPath();
        c.rect(-sideLength / 2, -sideLength / 2, sideLength, sideLength); 
        c.fillStyle = query.color;
        c.fill();
        c.strokeStyle = darkColor(hexToRgb(query.color));
        c.lineWidth = 3;
        c.stroke();
        c.restore(); 
    }
    else {
        c.beginPath(); 
        c.arc(pos.x, pos.y, scale * 24, 0, Math.PI * 2, true);
        c.fillStyle = query.color; 
        c.fill();
        c.strokeStyle = darkColor(hexToRgb(query.color)); 
        c.lineWidth = 3;
        c.stroke();

    }
    c.font = '32px Helvetica';
    c.fillStyle = 'white';
    c.fillText(queryText, pos.x, pos.y + 10);
    c.strokeStyle = 'black'; 
    c.lineWidth = 1; 
    c.strokeText(queryText, pos.x, pos.y + 10);
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

export function toggleVisiblity(element, isVisible) {
    element.style.visibility = isVisible ? 'visible' : 'hidden';
}
