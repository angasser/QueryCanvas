import { addMetadataToUrl, getMetadataFromUrl } from "./util.js";

export const modifyMode = Object.freeze({
    All: 0,
    CodeOnly: 1,
    QueryOnly: 2,
});

export const shapeType = Object.freeze({
    Circle: 0,
    Rectangle: 1,
    Rhombus: 2,
});

export const toolType = Object.freeze({
    menu: 0,
    help: 1,
    code: 2,
    result: 3,
    none: -1,
});

export function toToolType(i) {
    return i === 0 ? toolType.menu :
        i === 1 ? toolType.help :
        i === 2 ? toolType.code :
        toolType.result;
            
}

export const hoverType = Object.freeze({
    queryList: 0,
    viewport: 1,
    result: 2,
    code: 3,
});

export const interactionType = Object.freeze({
    None: 0,
    Highlighted: 1,
    Selected: 2,
    Disabled: 3,
});

export class GameState{
    constructor(viewport, uiDisplay, codeDisplay, tutorial) {
        const m = getMetadataFromUrl("testGroup");
        if (m !== null) {
            this.testGroup = parseInt(m);
        }
        else {
            addMetadataToUrl("testGroup", -1);
            this.testGroup = -1;
        }
        this.testIteration = -1;
            
        this.viewport = viewport;
        this.uiDisplay = uiDisplay;
        this.codeDisplay = codeDisplay;
        this.tutorial = tutorial;

        this.modifyMode = modifyMode.QueryOnly;
        this.tabWidth = 0;
        this.wordWrap = false;

        this.activeExpression = null;
        this.activeTask = null;
        this.tasks = new Map();

        this.undoStack = [];
        this.redoStack = [];

        this.selectedToolTab = toolType.result;
    }

    hasExp() {
        return this.activeExpression !== null;
    }

    isActiveView(viewId) {
        if (!this.hasExp())
            return false;
        return this.activeExpression.activeView.id === viewId;
    }
}

export class TaskState {
    constructor(title, taskDesc, queryDescription, codeDescription, codeString, expressions) {
        this.title = title;
        this.codeChangeCount = 0;
        this.codeString = codeString;
        this.expressions = expressions;
        this.taskDesc = taskDesc;
        this.queryDescription = queryDescription;
        this.codeDescription = codeDescription;

        this.activeExpression = null;
        this.hasBeenViewed = false;
    }
}

export class TaskExpressionState{
    constructor(id, loc, varLoc, queries, viewportStates) {
        this.id = id;
        this.loc = loc;
        this.varLoc = varLoc;

        this.codeVariableOverride = null;
        this.codeQueryOverride = null;

        this.queries = queries;
        this.activeView = viewportStates.has(0) ? viewportStates.get(0) : null;
        this.viewportStates = viewportStates;

        this.hoveringType = hoverType.viewport;
        this.hoveredQueries = new Set();
        this.hoveredShapes = new Set();
        this.hoveredFragments = new Set();

        this.selectedShapes = new Set();
        this.boxSelectedShapes = new Set();
        this.selectedQuery = null;

        this.boxSelectionBox = null;
        this.isBoxSelecting = false;

        this.areQueriesVisible = false;
        this.isViewportSelectionVisible = false;
        this.visibleQueryShapeRows = new Set();
    }
}

export class ExpressionLocation{
    constructor(expId, min, max) {
        this.expId = expId;
        this.min = min;
        this.max = max;
    }
}

export class ViewportState{
    constructor(id, name) {
        this.id = id;
        this.name = name;

        this.trans = { x: 0, y: 0 };
        this.scale = 1;

        this.shapes = new Map();
        this.fragments = new Map();

        this.allInactiveFragments = new Set();
    }

}

export class VennQuery{
    constructor(id, content, color) {
        this.id = id;
        this.content = content;
        this.color = color;
    }
}

export class VennShape{
    constructor(shapeId, queryId, shapeType, center, radius) {
        this.shapeId = shapeId;
        this.queryId = queryId;
        this.shapeType = shapeType;
        this.center = center;
        this.radius = radius;
        this.radius2 = radius;
    }
}

export class VennFragment{
    constructor(fragmentId, points, color, depth) {
        this.fragmentId = fragmentId;
        this.color = color;
        this.points = points;
        this.depth = depth
    }
}

export class fragmentIterator {
    constructor(shapes) {
        this.shapes = [...shapes.keys()];
        this.subsetIndex = 0; 
        this.totalSubsets = 1 << this.shapes.length; 
    }

    hasNext() {
        return this.subsetIndex < this.totalSubsets;
    }

    next() {
        if (!this.hasNext()) {
            throw new Error("No more subsets.");
        }
        let subset = [];
        for (let i = 0; i < this.shapes.length; i++) {
            if (this.subsetIndex & (1 << i)) {
                subset.push(this.shapes[i]);
            }
        }

        this.subsetIndex++;
        return subset;
    }
}

