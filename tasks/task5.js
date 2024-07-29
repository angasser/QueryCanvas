import { createTask } from "../stateManager.js";

const code =
`
class Cell:
    def __init__(self, position, has_snake, has_fruit):
        self.position = position
        self.has_snake = has_snake
        self.has_fruit = has_fruit
        
# Setup the game 
# [...]
is_finished = False

# Main loop
[Q3v]while [Q3]:
    current_head_cell = get_current_head_cell()
    next_head_cell = get_next_cell(current_head_cell)
    
    is_in_bounds = check_bounds(next_head_cell.position)
    [Q1v]if [Q1]:
        is_finished = True
        continue
    
    [Q2v]if [Q2]:
        eat_fruit()
        
    apply_movement()

`;

const description = 
    `Your friend tried to program the game snake, but his implementation contains some bugs that he can’t resolve.
He already pinpointed it to the game’s main loop and knows it is related with some boolean expression.
Help him fix the game by only editing the boolean expressions.
`;

const queryDescription =
    `Only solve this task with the visual query system.`;

const codeDescription =
    `Only solve this task using the code editor without the visual query system.`;

export function task5(state) {
    
    const task = createTask(state, "Task 5", description, queryDescription, codeDescription, code, new Map([
        ["Q3", {
            varString: "",
            expressionString: "True",
            expression: `{"id":0,"loc":{"expId":0,"min":0,"max":0},"varLoc":{"expId":0,"min":0,"max":0},"codeVariableOverride":null,"codeQueryOverride":null,"queries":{"_type":"Map","entries":[[0,{"id":0,"content":"Main View","color":"#264653"}]]},"activeView":{"id":0,"name":"Main View","shapes":{"_type":"Map","entries":[]},"fragments":{"_type":"Map","entries":[]},"allInactiveFragments":{"_type":"Set","values":[]}},"viewportStates":{"_type":"Map","entries":[[0,{"id":0,"name":"Main View","shapes":{"_type":"Map","entries":[]},"fragments":{"_type":"Map","entries":[]},"allInactiveFragments":{"_type":"Set","values":[]}}]]},"hoveringType":1,"hoveredQueries":{"_type":"Set","values":[]},"hoveredShapes":{"_type":"Set","values":[]},"hoveredFragments":{"_type":"Set","values":[0]},"selectedShapes":{"_type":"Set","values":[]},"boxSelectedShapes":{"_type":"Set","values":[]},"selectedQuery":{"id":0,"type":"query"},"boxSelectionBox":null,"isBoxSelecting":false,"areQueriesVisible":false,"isViewportSelectionVisible":false,"visibleQueryShapeRows":{"_type":"Set","values":[]}}`
        }],
        ["Q1", {
            varString: "",
            expressionString: "((is_finished and not is_in_bounds) or not next_head_cell.has_snake)  ",
            expression: `{"id":0,"loc":{"expId":0,"min":0,"max":70},"varLoc":{"expId":0,"min":0,"max":0},"codeVariableOverride":"","codeQueryOverride":"((is_in_bounds and not is_finished) or not next_head_cell.has_snake)","queries":{"_type":"Map","entries":[[0,{"id":0,"content":"Main View","color":"#264653"}],[1,{"id":1,"content":"is_finished","color":"#2A9D8F"}],[2,{"id":2,"content":"is_in_bounds","color":"#E76F51"}],[3,{"id":3,"content":"next_head_cell.has_snake","color":"#457B9D"}]]},"activeView":{"id":0,"name":"Main View","shapes":{"_type":"Map","entries":[[0,{"shapeId":0,"queryId":1,"shapeType":0,"center":{"x":1043.5,"y":605.5},"radius":150,"radius2":150}],[1,{"shapeId":1,"queryId":2,"shapeType":0,"center":{"x":808.5,"y":606.5},"radius":150,"radius2":150}],[2,{"shapeId":2,"queryId":3,"shapeType":0,"center":{"x":1403.5,"y":597.5},"radius":150,"radius2":150}]]},"fragments":{"_type":"Map","entries":[]},"allInactiveFragments":{"_type":"Set","values":[3,1,4]}},"viewportStates":{"_type":"Map","entries":[[0,{"id":0,"name":"Main View","shapes":{"_type":"Map","entries":[[0,{"shapeId":0,"queryId":1,"shapeType":0,"center":{"x":1043.5,"y":605.5},"radius":150,"radius2":150}],[1,{"shapeId":1,"queryId":2,"shapeType":0,"center":{"x":808.5,"y":606.5},"radius":150,"radius2":150}],[2,{"shapeId":2,"queryId":3,"shapeType":0,"center":{"x":1403.5,"y":597.5},"radius":150,"radius2":150}]]},"fragments":{"_type":"Map","entries":[]},"allInactiveFragments":{"_type":"Set","values":[3,1,4]}}]]},"hoveringType":1,"hoveredQueries":{"_type":"Set","values":[]},"hoveredShapes":{"_type":"Set","values":[]},"hoveredFragments":{"_type":"Set","values":[0]},"selectedShapes":{"_type":"Set","values":[]},"boxSelectedShapes":{"_type":"Set","values":[]},"selectedQuery":null,"boxSelectionBox":null,"isBoxSelecting":false,"areQueriesVisible":true,"isViewportSelectionVisible":false,"visibleQueryShapeRows":{"_type":"Set","values":[3]}}`
        }],
        ["Q2", {
            varString: "",
            expressionString: "next_head_cell.has_fruit and is_in_bounds",
            expression: `{"id":1,"loc":{"expId":1,"min":0,"max":0},"varLoc":{"expId":1,"min":0,"max":0},"codeVariableOverride":null,"codeQueryOverride":null,"queries":{"_type":"Map","entries":[[0,{"id":0,"content":"Main View","color":"#264653"}],[1,{"id":1,"content":"next_head_cell.has_fruit","color":"#2A9D8F"}],[2,{"id":2,"content":"is_in_bounds","color":"#E76F51"}]]},"activeView":{"id":0,"name":"Main View","shapes":{"_type":"Map","entries":[[0,{"shapeId":0,"queryId":1,"shapeType":0,"center":{"x":964.5,"y":501.5},"radius":150,"radius2":150}],[1,{"shapeId":1,"queryId":2,"shapeType":0,"center":{"x":1211.5,"y":499.5},"radius":150,"radius2":150}]]},"fragments":{"_type":"Map","entries":[]},"allInactiveFragments":{"_type":"Set","values":[2,1]}},"viewportStates":{"_type":"Map","entries":[[0,{"id":0,"name":"Main View","shapes":{"_type":"Map","entries":[[0,{"shapeId":0,"queryId":1,"shapeType":0,"center":{"x":964.5,"y":501.5},"radius":150,"radius2":150}],[1,{"shapeId":1,"queryId":2,"shapeType":0,"center":{"x":1211.5,"y":499.5},"radius":150,"radius2":150}]]},"fragments":{"_type":"Map","entries":[]},"allInactiveFragments":{"_type":"Set","values":[2,1]}}]]},"hoveringType":1,"hoveredQueries":{"_type":"Set","values":[2]},"hoveredShapes":{"_type":"Set","values":[1]},"hoveredFragments":{"_type":"Set","values":[2]},"selectedShapes":{"_type":"Set","values":[]},"boxSelectedShapes":{"_type":"Set","values":[]},"selectedQuery":null,"boxSelectionBox":null,"isBoxSelecting":false,"areQueriesVisible":true,"isViewportSelectionVisible":false,"visibleQueryShapeRows":{"_type":"Set","values":[2]}}`
        } ],
    ]));

    return task;
}