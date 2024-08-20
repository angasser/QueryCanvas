import { createTask } from "../stateManager.js";

const code =
`
def water_plants(is_raining, soil_dry):
    # Edit this function
    [Q1v]return [Q1]
`;

const description = 
`Write a query that describes when you should water your plants:

You should water your plants if the soil is dry.
However, you don't need to water them if it's raining.`;

const queryDescription =
    `Only solve this task with the visual query system.`;

const codeDescription =
    `Only solve this task using the code editor without the visual query system.`;

export function task8(state) {
    
    const task = createTask(state, "Test task: Plants", description, queryDescription, codeDescription, code, new Map([
        ["Q1", {
            varString: "",
            expressionString: "not is_raining",
            expression: `{"id":561559275,"loc":{"expId":561559275,"min":40,"max":54},"varLoc":{"expId":561559275,"min":13,"max":13},"codeVariableOverride":"","codeQueryOverride":"not is_raining","queries":{"_type":"Map","entries":[[0,{"id":0,"content":"Main View","color":"#264653"}],[1,{"id":1,"content":"is_raining","color":"#2A9D8F"}],[2,{"id":2,"content":"soil_dry","color":"#E76F51"}]]},"activeView":{"id":0,"name":"Main View","trans":{"x":0,"y":0},"scale":1,"shapes":{"_type":"Map","entries":[[0,{"shapeId":0,"queryId":1,"shapeType":0,"center":{"x":894,"y":530.5},"radius":150,"radius2":150}]]},"fragments":{"_type":"Map","entries":[]},"allInactiveFragments":{"_type":"Set","values":[1]}},"viewportStates":{"_type":"Map","entries":[[0,{"id":0,"name":"Main View","trans":{"x":0,"y":0},"scale":1,"shapes":{"_type":"Map","entries":[[0,{"shapeId":0,"queryId":1,"shapeType":0,"center":{"x":894,"y":530.5},"radius":150,"radius2":150}]]},"fragments":{"_type":"Map","entries":[]},"allInactiveFragments":{"_type":"Set","values":[1]}}]]},"hoveringType":1,"hoveredQueries":{"_type":"Set","values":[]},"hoveredShapes":{"_type":"Set","values":[]},"hoveredFragments":{"_type":"Set","values":[0]},"selectedShapes":{"_type":"Set","values":[]},"boxSelectedShapes":{"_type":"Set","values":[]},"selectedQuery":null,"boxSelectionBox":null,"isBoxSelecting":false,"areQueriesVisible":true,"isViewportSelectionVisible":false,"visibleQueryShapeRows":{"_type":"Set","values":[2]}}`
        } ],
    ]));

    return task;
}