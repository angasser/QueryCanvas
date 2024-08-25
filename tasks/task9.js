import { createTask } from "../stateManager.js";

const code =
`
def alarm(person_detected, door_locked):
    # Edit this function
    [Q1v]return [Q1]
`;

const description = 
`You have installed a new security system. The alarm should sound if and only if a person is detected and the door is locked at the same time.`;

const queryDescription =
    `Only solve this task with the visual query system.`;

const codeDescription =
    `Only solve this task using the code editor without the visual query system.`;

export function task9(state) {
    
    const task = createTask(state, "Task 1: Security system", description, queryDescription, codeDescription, code, new Map([
        ["Q1", {
            varString: "",
            expressionString: "door_locked and not person_detected",
            expression: `{"id":813309024,"loc":{"expId":813309024,"min":40,"max":75},"varLoc":{"expId":813309024,"min":13,"max":13},"codeVariableOverride":"","codeQueryOverride":"door_locked and not person_detected","queries":{"_type":"Map","entries":[[0,{"id":0,"content":"Main View","color":"#264653"}],[1,{"id":1,"content":"person_detected","color":"#2A9D8F"}],[2,{"id":2,"content":"door_locked","color":"#E76F51"}]]},"activeView":{"id":0,"name":"Main View","trans":{"x":0,"y":0},"scale":1,"shapes":{"_type":"Map","entries":[[0,{"shapeId":0,"queryId":1,"shapeType":0,"center":{"x":697,"y":495.5},"radius":150,"radius2":150}],[1,{"shapeId":1,"queryId":2,"shapeType":0,"center":{"x":938,"y":500.5},"radius":150,"radius2":150}]]},"fragments":{"_type":"Map","entries":[]},"allInactiveFragments":{"_type":"Set","values":[1,3]}},"viewportStates":{"_type":"Map","entries":[[0,{"id":0,"name":"Main View","trans":{"x":0,"y":0},"scale":1,"shapes":{"_type":"Map","entries":[[0,{"shapeId":0,"queryId":1,"shapeType":0,"center":{"x":697,"y":495.5},"radius":150,"radius2":150}],[1,{"shapeId":1,"queryId":2,"shapeType":0,"center":{"x":938,"y":500.5},"radius":150,"radius2":150}]]},"fragments":{"_type":"Map","entries":[]},"allInactiveFragments":{"_type":"Set","values":[1,3]}}]]},"hoveringType":1,"hoveredQueries":{"_type":"Set","values":[]},"hoveredShapes":{"_type":"Set","values":[]},"hoveredFragments":{"_type":"Set","values":[0]},"selectedShapes":{"_type":"Set","values":[]},"boxSelectedShapes":{"_type":"Set","values":[]},"selectedQuery":null,"boxSelectionBox":null,"isBoxSelecting":false,"areQueriesVisible":true,"isViewportSelectionVisible":false,"visibleQueryShapeRows":{"_type":"Set","values":[2]}}`
        } ],
    ]));

    return task;
}