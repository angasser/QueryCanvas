import { createTask } from "../stateManager.js";

const code =
`
def turn_on_AC(temperature, at_home):
    # Edit this function
    [Q1v]return [Q1]
`;

const description = 
`The air conditioning (AC) should be turned on if the temperature is either below 17°C or if it's above 23°C. However, if you are not at home, the air conditioning should only be turned on if the temperature is above 17°C.`;

const queryDescription =
    `Only solve this task with the visual query system.`;

const codeDescription =
    `Only solve this task using the code editor without the visual query system.`;

export function task7(state) {
    
    const task = createTask(state, "Task 4: A/C", description, queryDescription, codeDescription, code, new Map([
        ["Q1", {
            varString: "",
            expressionString: "at_home",
            expression: `{"id":230832740,"loc":{"expId":230832740,"min":40,"max":47},"varLoc":{"expId":230832740,"min":13,"max":13},"codeVariableOverride":"","codeQueryOverride":"at_home","queries":{"_type":"Map","entries":[[0,{"id":0,"content":"Main View","color":"#264653"}],[1,{"id":1,"content":"temperature < 17.0","color":"#2A9D8F"}],[2,{"id":2,"content":"temperature > 23.0","color":"#E76F51"}],[3,{"id":3,"content":"at_home","color":"#457B9D"}]]},"activeView":{"id":0,"name":"Main View","trans":{"x":0,"y":0},"scale":1,"shapes":{"_type":"Map","entries":[[2,{"shapeId":2,"queryId":3,"shapeType":0,"center":{"x":1079.5,"y":431.5},"radius":150,"radius2":150}]]},"fragments":{"_type":"Map","entries":[]},"allInactiveFragments":{"_type":"Set","values":[]}},"viewportStates":{"_type":"Map","entries":[[0,{"id":0,"name":"Main View","trans":{"x":0,"y":0},"scale":1,"shapes":{"_type":"Map","entries":[[2,{"shapeId":2,"queryId":3,"shapeType":0,"center":{"x":1079.5,"y":431.5},"radius":150,"radius2":150}]]},"fragments":{"_type":"Map","entries":[]},"allInactiveFragments":{"_type":"Set","values":[]}}]]},"hoveringType":1,"hoveredQueries":{"_type":"Set","values":[]},"hoveredShapes":{"_type":"Set","values":[]},"hoveredFragments":{"_type":"Set","values":[0]},"selectedShapes":{"_type":"Set","values":[]},"boxSelectedShapes":{"_type":"Set","values":[]},"selectedQuery":null,"boxSelectionBox":null,"isBoxSelecting":false,"areQueriesVisible":true,"isViewportSelectionVisible":false,"visibleQueryShapeRows":{"_type":"Set","values":[3,2,1]}}`
        } ],
    ]));

    return task;
}