import { createTask } from "../stateManager.js";

const code =
`
def set_alarm(has_work, has_school, has_event, stay_up_late, is_weekend, is_unwell):
    # Edit this function
    [Q1v]return [Q1]
`;

const description = 
`You only want to set your alarm clock when any of the following conditions is true:

(1) You have work or school the next day, unless it's a weekend and you didn't stay up late.
(2) You have both work and an event the next day and it's not the weekend.
(3) You are not feeling unwell.`;

const queryDescription =
    `Only solve this task with the visual query system.`;

const codeDescription =
    `Only solve this task using the code editor without the visual query system.`;

export function task12(state) {
    
    const task = createTask(state, "Task 8: Alarm", description, queryDescription, codeDescription, code, new Map([
        ["Q1", {
            varString: "",
            expressionString: "True",
            expression: `{"id":500950785,"loc":{"expId":500950785,"min":40,"max":44},"varLoc":{"expId":500950785,"min":13,"max":13},"codeVariableOverride":"","codeQueryOverride":"True","queries":{"_type":"Map","entries":[[0,{"id":0,"content":"Main View","color":"#264653"}],[1,{"id":1,"content":"has_school","color":"#9D8F2A"}],[2,{"id":2,"content":"has_work","color":"#2A9D8F"}],[3,{"id":3,"content":"has_event","color":"#E76F51"}],[4,{"id":4,"content":"stay_up_late","color":"#457B9D"}],[5,{"id":5,"content":"is_weekend","color":"#F4A261"}],[6,{"id":6,"content":"is_unwell","color":"#E63946"}]]},"activeView":{"id":0,"name":"Main View","trans":{"x":0,"y":0},"scale":1,"shapes":{"_type":"Map","entries":[]},"fragments":{"_type":"Map","entries":[]},"allInactiveFragments":{"_type":"Set","values":[]}},"viewportStates":{"_type":"Map","entries":[[0,{"id":0,"name":"Main View","trans":{"x":0,"y":0},"scale":1,"shapes":{"_type":"Map","entries":[]},"fragments":{"_type":"Map","entries":[]},"allInactiveFragments":{"_type":"Set","values":[]}}]]},"hoveringType":1,"hoveredQueries":{"_type":"Set","values":[]},"hoveredShapes":{"_type":"Set","values":[]},"hoveredFragments":{"_type":"Set","values":[0]},"selectedShapes":{"_type":"Set","values":[]},"boxSelectedShapes":{"_type":"Set","values":[]},"selectedQuery":null,"boxSelectionBox":null,"isBoxSelecting":false,"areQueriesVisible":true,"isViewportSelectionVisible":false,"visibleQueryShapeRows":{"_type":"Set","values":[5]}}`
        } ],
    ]));

    return task;
}