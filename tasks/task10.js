import { createTask } from "../stateManager.js";

const code =
`
def energy_saving_mode(energy_remaining, plugged_in):
    # Edit this function
    [Q1v]return [Q1]
`;

const description = 
`You want to control when your smart phone enters energy saving mode:

Energy saving mode is only activated if the remaining energy is below 0.2 and it's not plugged in.`;

const queryDescription =
    `Only solve this task with the visual query system.`;

const codeDescription =
    `Only solve this task using the code editor without the visual query system.`;

export function task10(state) {
    
    const task = createTask(state, "Task 2: Energy saving", description, queryDescription, codeDescription, code, new Map([
        ["Q1", {
            varString: "",
            expressionString: "energy_remaining < 0.2 or not plugged_in",
            expression: `{"id":585485476,"loc":{"expId":585485476,"min":40,"max":80},"varLoc":{"expId":585485476,"min":13,"max":13},"codeVariableOverride":"","codeQueryOverride":"energy_remaining < 0.2 or not plugged_in","queries":{"_type":"Map","entries":[[0,{"id":0,"content":"Main View","color":"#264653"}],[1,{"id":1,"content":"energy_remaining < 0.2","color":"#2A9D8F"}],[2,{"id":2,"content":"plugged_in","color":"#E76F51"}]]},"activeView":{"id":0,"name":"Main View","trans":{"x":0,"y":0},"scale":1,"shapes":{"_type":"Map","entries":[[0,{"shapeId":0,"queryId":1,"shapeType":0,"center":{"x":846,"y":468.5},"radius":150,"radius2":150}],[1,{"shapeId":1,"queryId":2,"shapeType":0,"center":{"x":1196,"y":466.5},"radius":150,"radius2":150}]]},"fragments":{"_type":"Map","entries":[]},"allInactiveFragments":{"_type":"Set","values":[2]}},"viewportStates":{"_type":"Map","entries":[[0,{"id":0,"name":"Main View","trans":{"x":0,"y":0},"scale":1,"shapes":{"_type":"Map","entries":[[0,{"shapeId":0,"queryId":1,"shapeType":0,"center":{"x":846,"y":468.5},"radius":150,"radius2":150}],[1,{"shapeId":1,"queryId":2,"shapeType":0,"center":{"x":1196,"y":466.5},"radius":150,"radius2":150}]]},"fragments":{"_type":"Map","entries":[]},"allInactiveFragments":{"_type":"Set","values":[2]}}]]},"hoveringType":1,"hoveredQueries":{"_type":"Set","values":[]},"hoveredShapes":{"_type":"Set","values":[]},"hoveredFragments":{"_type":"Set","values":[0]},"selectedShapes":{"_type":"Set","values":[]},"boxSelectedShapes":{"_type":"Set","values":[]},"selectedQuery":null,"boxSelectionBox":null,"isBoxSelecting":false,"areQueriesVisible":true,"isViewportSelectionVisible":false,"visibleQueryShapeRows":{"_type":"Set","values":[2]}}`
        } ],
    ]));

    return task;
}