import { createTask } from "../stateManager.js";

const code =
`
def go_to_picnic(is_hot, is_holiday, friends_available, is_rainy, is_concert):
    # Edit this function
    [Q1v]return [Q1]
`;

const description = 
`You will go to the park if any of the following conditions is true:

(1) it's hot, your friends are available and it's a holiday,
(2) there's a concert, your friends are available and it's a holiday,
(3) it's neither hot nor rainy.`;


const queryDescription =
    `Only solve this task with the visual query system.`;

const codeDescription =
    `Only solve this task using the code editor without the visual query system.`;

export function task11(state) {
    
    const task = createTask(state, "Task 7: Picnic", description, queryDescription, codeDescription, code, new Map([
        ["Q1", {
            varString: "",
            expressionString: "True",
            expression: `{"id":45740491,"loc":{"expId":45740491,"min":40,"max":44},"varLoc":{"expId":45740491,"min":13,"max":13},"codeVariableOverride":"","codeQueryOverride":"True","queries":{"_type":"Map","entries":[[0,{"id":0,"content":"Main View","color":"#264653"}],[1,{"id":1,"content":"is_hot","color":"#2A9D8F"}],[2,{"id":2,"content":"is_holiday","color":"#E76F51"}],[3,{"id":3,"content":"friends_available","color":"#457B9D"}],[4,{"id":4,"content":"is_rainy","color":"#F4A261"}],[5,{"id":5,"content":"is_concert","color":"#E63946"}]]},"activeView":{"id":0,"name":"Main View","trans":{"x":0,"y":0},"scale":1,"shapes":{"_type":"Map","entries":[]},"fragments":{"_type":"Map","entries":[]},"allInactiveFragments":{"_type":"Set","values":[]}},"viewportStates":{"_type":"Map","entries":[[0,{"id":0,"name":"Main View","trans":{"x":0,"y":0},"scale":1,"shapes":{"_type":"Map","entries":[]},"fragments":{"_type":"Map","entries":[]},"allInactiveFragments":{"_type":"Set","values":[]}}]]},"hoveringType":1,"hoveredQueries":{"_type":"Set","values":[]},"hoveredShapes":{"_type":"Set","values":[]},"hoveredFragments":{"_type":"Set","values":[0]},"selectedShapes":{"_type":"Set","values":[]},"boxSelectedShapes":{"_type":"Set","values":[]},"selectedQuery":null,"boxSelectionBox":null,"isBoxSelecting":false,"areQueriesVisible":true,"isViewportSelectionVisible":false,"visibleQueryShapeRows":{"_type":"Set","values":[5]}}`
        } ],
    ]));

    return task;
}