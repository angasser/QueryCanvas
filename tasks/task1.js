import { createTask } from "../stateManager.js";

const code =
`
def correct_conclusion(player1_win, player2_win, timeout_occured, game_canceled):
    # Edit this function
    [Q1v]return [Q1]
`;

const description = 
`A game has concluded correctly only when either Player 1 or Player 2 have won, but not both. Independently of the above condition, the game also concludes correctly if there is a timeout. However, the game *never* concludes correctly if it is canceled.
`;

const queryDescription =
    `Only solve this task with the visual query system.`;

const codeDescription =
    `Only solve this task using the code editor without the visual query system.`;

export function task1(state) {
    
    const task = createTask(state, "Task 5: Game outcome", description, queryDescription, codeDescription, code, new Map([
        ["Q1", {
            varString: "",
            expressionString: "True",
            expression: `{"id":0,"loc":{"expId":0,"min":0,"max":4},"varLoc":{"expId":0,"min":0,"max":0},"codeVariableOverride":"","codeQueryOverride":"True","queries":{"_type":"Map","entries":[[0,{"id":0,"content":"Main View","color":"#264653"}],[1,{"id":1,"content":"player1_win","color":"#2A9D8F"}],[2,{"id":2,"content":"player2_win","color":"#E76F51"}],[3,{"id":3,"content":"timeout_occured","color":"#457B9D"}],[4,{"id":4,"content":"game_canceled","color":"#F4A261"}]]},"activeView":{"id":0,"name":"Main View","shapes":{"_type":"Map","entries":[]},"fragments":{"_type":"Map","entries":[]},"allInactiveFragments":{"_type":"Set","values":[]}},"viewportStates":{"_type":"Map","entries":[[0,{"id":0,"name":"Main View","shapes":{"_type":"Map","entries":[]},"fragments":{"_type":"Map","entries":[]},"allInactiveFragments":{"_type":"Set","values":[]}}]]},"hoveringType":1,"hoveredQueries":{"_type":"Set","values":[]},"hoveredShapes":{"_type":"Set","values":[]},"hoveredFragments":{"_type":"Set","values":[0]},"selectedShapes":{"_type":"Set","values":[]},"boxSelectedShapes":{"_type":"Set","values":[]},"selectedQuery":null,"boxSelectionBox":null,"isBoxSelecting":false,"areQueriesVisible":true,"isViewportSelectionVisible":false,"visibleQueryShapeRows":{"_type":"Set","values":[4]}}`
        } ],
    ]));

    return task;
}