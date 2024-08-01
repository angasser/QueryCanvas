import { createTask } from "../stateManager.js";

const code =
`
# Variables
[Q1v]

# Main expression
return [Q1]


`;

const description = 
    `Use the sandbox to test and play around with the system.
`;

const queryDescription =
    ``;

const codeDescription =
    ``;

export function taskSandbox(state) {
    const task = createTask(state, "Sandbox", description, queryDescription, codeDescription, code, new Map([
        ["Q1", {
            varString: "",
            expressionString: "True",
            expression: `{"id":0,"loc":{"expId":0,"min":0,"max":0},"varLoc":{"expId":0,"min":0,"max":0},"codeVariableOverride":null,"codeQueryOverride":null,"queries":{"_type":"Map","entries":[[0,{"id":0,"content":"Main View","color":"#264653"}]]},"activeView":{"id":0,"name":"Main View","trans":{"x":0,"y":0},"scale":1,"shapes":{"_type":"Map","entries":[]},"fragments":{"_type":"Map","entries":[]},"allInactiveFragments":{"_type":"Set","values":[]}},"viewportStates":{"_type":"Map","entries":[[0,{"id":0,"name":"Main View","trans":{"x":0,"y":0},"scale":1,"shapes":{"_type":"Map","entries":[]},"fragments":{"_type":"Map","entries":[]},"allInactiveFragments":{"_type":"Set","values":[]}}]]},"hoveringType":1,"hoveredQueries":{"_type":"Set","values":[]},"hoveredShapes":{"_type":"Set","values":[]},"hoveredFragments":{"_type":"Set","values":[0]},"selectedShapes":{"_type":"Set","values":[]},"boxSelectedShapes":{"_type":"Set","values":[]},"selectedQuery":{"id":0,"type":"query"},"boxSelectionBox":null,"isBoxSelecting":false,"areQueriesVisible":false,"isViewportSelectionVisible":false,"visibleQueryShapeRows":{"_type":"Set","values":[]}}`
        } ],
    ]));

    return task;
}