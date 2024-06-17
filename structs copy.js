export const shapeType = Object.freeze({
    Circle: 0,
    Rectangle: 1,
    Rhombus: 2,
});

export const interactionType = Object.freeze({
    None: 0,
    Hilighted: 1,
    Selected: 2,
    Disabled: 3,
});

export class GameState{
    constructor(viewport, uiDisplay) {
        this.viewport = viewport;
        this.uiDisplay = uiDisplay;

        this.queries = new Map();
        this.shapes = new Map();
        this.fragments = new Map();

        this.inactiveFragments = new Set();
        this.allInactiveFragments = new Set();
        
        this.hoveredQueries = new Set();
        this.hoveredShapes = new Set();
        this.hoveringType = hoverType.viewport;
        this.selectedShapes = new Set();
        this.selectedQuery = null;

        this.boxSelectionBox = null;
        this.isBoxSelecting = false;

        this.areQueriesVisible = false;
        this.visibleQueryShapeRows = new Set();

        this.queryTagRef = document.querySelector('#queryTags');
        this.boundingBoxRef = document.querySelector('#boundingBox');
    }
}

export class ViewportState{
    
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

