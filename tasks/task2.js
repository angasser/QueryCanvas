import { createTask } from "../stateManager.js";

const code =
`
def raincoat_required(is_raining, is_cold, has_umbrella, is_windy):
    # Edit this function
    [Q1v]return [Q1]
`;

const description = 
`Write a query that describes when you should wear a raincoat:
You only wear a raincoat if it is raining or it is cold.
However, if it is raining, you don’t need one if you already have an umbrella.
Similarly, if it is raining and you have an umbrella, you still need one if the wind is strong.
`;

const queryDescription =
    `Only solve this task with the visual query system.`;

const codeDescription =
    `Only solve this task using the code editor without the visual query system.`;

export function task2(state) {
    
    const task = createTask(state, "Task 2", description, queryDescription, codeDescription, code, new Map([
        ["Q1", {
            varString: "",
            expressionString: "True",
            expression: `{"id":0,"loc":{"expId":0,"min":0,"max":4},"varLoc":{"expId":0,"min":0,"max":0},"codeVariableOverride":"","codeQueryOverride":"True","queries":{"_type":"Map","entries":[[0,{"id":0,"content":"Main View","color":"#264653"}],[1,{"id":1,"content":"is_raining","color":"#2A9D8F"}],[2,{"id":2,"content":"is_cold","color":"#E76F51"}],[3,{"id":3,"content":"has_umbrella","color":"#457B9D"}],[4,{"id":4,"content":"is_windy","color":"#F4A261"}]]},"activeView":{"id":0,"name":"Main View","shapes":{"_type":"Map","entries":[]},"fragments":{"_type":"Map","entries":[]},"allInactiveFragments":{"_type":"Set","values":[]}},"viewportStates":{"_type":"Map","entries":[[0,{"id":0,"name":"Main View","shapes":{"_type":"Map","entries":[]},"fragments":{"_type":"Map","entries":[]},"allInactiveFragments":{"_type":"Set","values":[]}}]]},"hoveringType":1,"hoveredQueries":{"_type":"Set","values":[]},"hoveredShapes":{"_type":"Set","values":[]},"hoveredFragments":{"_type":"Set","values":[0]},"selectedShapes":{"_type":"Set","values":[]},"boxSelectedShapes":{"_type":"Set","values":[]},"selectedQuery":null,"boxSelectionBox":null,"isBoxSelecting":false,"areQueriesVisible":true,"isViewportSelectionVisible":false,"visibleQueryShapeRows":{"_type":"Set","values":[4]}}`
        } ],
    ]));

    return task;
}