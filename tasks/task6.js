import { createTask } from "../stateManager.js";

const code =
`
class State:
    def __init__(self, position, ghosts, has_fruit, is_power_pellet_active, dots_eaten, score, is_finished, has_succeeded):
        self.position = position
        self.ghosts = ghosts
        self.is_power_pellet_active = is_power_pellet_active
        self.dots_eaten = dots_eaten
        self.score = score
        self.is_finished = is_finished
        self.has_succeeded = has_succeeded
        
# Setup the game 
# [...]
MAX_DOTS = 244 

# Main loop
main_loop(state):
    if state.is_finished:
        return
    
    apply_movement(state)
    apply_ghost_movement(state)
    
    does_overlap_ghost = check_overlaps(state)
    [Q2v]if [Q2]:
        state.has_succeeded = True
    
    # The game ends (success or fail)
    [Q1v]if [Q1]:
        state.is_finished = True
        finish_game(state)
        return

`;

const description = 
    `Inspired by your friend’s enthusiasm you also want to program another retro game – Pac Man.
    However, ironically you also stumble over a bug you can’t seem to uncover.
    You already pinpointed it to the game’s main loop and know it is related with some boolean expression.
`;

const queryDescription =
    `Only solve this task with the visual query system.`;

const codeDescription =
    `Only solve this task using the code editor without the visual query system.`;

export function task6(state) {
    
    const task = createTask(state, "Task 6", description, queryDescription, codeDescription, code, new Map([
        ["Q2", {
            varString: "",
            expressionString: "state.dots_eaten >= MAX_DOTS",
            expression: `{"id":0,"loc":{"expId":0,"min":0,"max":0},"varLoc":{"expId":0,"min":0,"max":0},"codeVariableOverride":null,"codeQueryOverride":null,"queries":{"_type":"Map","entries":[[0,{"id":0,"content":"Main View","color":"#264653"}],[1,{"id":1,"content":"state.dots_eaten >= MAX_DOTS","color":"#2A9D8F"}]]},"activeView":{"id":0,"name":"Main View","shapes":{"_type":"Map","entries":[[0,{"shapeId":0,"queryId":1,"shapeType":0,"center":{"x":1147.5,"y":513.5},"radius":192,"radius2":150}]]},"fragments":{"_type":"Map","entries":[]},"allInactiveFragments":{"_type":"Set","values":[]}},"viewportStates":{"_type":"Map","entries":[[0,{"id":0,"name":"Main View","shapes":{"_type":"Map","entries":[[0,{"shapeId":0,"queryId":1,"shapeType":0,"center":{"x":1147.5,"y":513.5},"radius":192,"radius2":150}]]},"fragments":{"_type":"Map","entries":[]},"allInactiveFragments":{"_type":"Set","values":[]}}]]},"hoveringType":1,"hoveredQueries":{"_type":"Set","values":[]},"hoveredShapes":{"_type":"Set","values":[]},"hoveredFragments":{"_type":"Set","values":[0]},"selectedShapes":{"_type":"Set","values":[]},"boxSelectedShapes":{"_type":"Set","values":[]},"selectedQuery":null,"boxSelectionBox":null,"isBoxSelecting":false,"areQueriesVisible":true,"isViewportSelectionVisible":false,"visibleQueryShapeRows":{"_type":"Set","values":[1]}}`
        }],
        ["Q1", {
            varString: "",
            expressionString: "((does_overlap_ghost != state.is_power_pellet_active) or state.dots_eaten__MAX_DOTS)  ",
            expression: `{"id":0,"loc":{"expId":0,"min":0,"max":0},"varLoc":{"expId":0,"min":0,"max":0},"codeVariableOverride":null,"codeQueryOverride":null,"queries":{"_type":"Map","entries":[[0,{"id":0,"content":"Main View","color":"#264653"}],[1,{"id":1,"content":"does_overlap_ghost","color":"#2A9D8F"}],[2,{"id":2,"content":"state.is_power_pellet_active","color":"#E76F51"}],[3,{"id":3,"content":"state.dots_eaten >= MAX_DOTS","color":"#457B9D"}]]},"activeView":{"id":0,"name":"Main View","shapes":{"_type":"Map","entries":[[0,{"shapeId":0,"queryId":1,"shapeType":0,"center":{"x":966.5,"y":393.5},"radius":150,"radius2":150}],[1,{"shapeId":1,"queryId":2,"shapeType":0,"center":{"x":975.5,"y":610.5},"radius":150,"radius2":150}],[2,{"shapeId":2,"queryId":3,"shapeType":0,"center":{"x":1335.5,"y":525.5},"radius":177,"radius2":150}]]},"fragments":{"_type":"Map","entries":[]},"allInactiveFragments":{"_type":"Set","values":[3]}},"viewportStates":{"_type":"Map","entries":[[0,{"id":0,"name":"Main View","shapes":{"_type":"Map","entries":[[0,{"shapeId":0,"queryId":1,"shapeType":0,"center":{"x":966.5,"y":393.5},"radius":150,"radius2":150}],[1,{"shapeId":1,"queryId":2,"shapeType":0,"center":{"x":975.5,"y":610.5},"radius":150,"radius2":150}],[2,{"shapeId":2,"queryId":3,"shapeType":0,"center":{"x":1335.5,"y":525.5},"radius":177,"radius2":150}]]},"fragments":{"_type":"Map","entries":[]},"allInactiveFragments":{"_type":"Set","values":[3]}}]]},"hoveringType":1,"hoveredQueries":{"_type":"Set","values":[]},"hoveredShapes":{"_type":"Set","values":[]},"hoveredFragments":{"_type":"Set","values":[0]},"selectedShapes":{"_type":"Set","values":[]},"boxSelectedShapes":{"_type":"Set","values":[]},"selectedQuery":null,"boxSelectionBox":null,"isBoxSelecting":false,"areQueriesVisible":true,"isViewportSelectionVisible":false,"visibleQueryShapeRows":{"_type":"Set","values":[3]}}`
        }],
    ]));

    return task;
}