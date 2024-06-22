import { initCodeTab } from "./codeDisplay.js";
import { addNewViewport, createNewQuery } from "./stateManager.js";
import { toInt } from "./util.js";

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
    constructor(viewport, uiDisplay) {
        this.viewport = viewport;
        this.uiDisplay = uiDisplay;
        this.isDirty = false;

        this.queries = new Map();
        this.activeView = new ViewportState(0, "Main View");
        this.viewportStates = new Map([[0, this.activeView]]);
        createNewQuery(this, 0, false);

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
        this.selectedToolTab = toolType.result;

        this.currentMinCode = 0;
        this.currentCodeLength = 0;
        this.codeHighlight = [];
        this.codeViewportHighlight = null;

        this.queryTagRef = document.querySelector('#queryTags');
        this.boundingBoxRef = document.querySelector('#boundingBox');
        initCodeTab(this, uiDisplay);
    }
}

export class ViewportState{
    constructor(id, name) {
        this.id = id;
        this.name = name;
        this.code = "";
        this.shapes = new Map();
        this.fragments = new Map();

        this.allInactiveFragments = new Set();
    }

    getName() {
        return this.name;
    }

    getId() {
        return this.id;
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

