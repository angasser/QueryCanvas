import { createTask } from "../stateManager.js";

const code =
`
class Athlete:
    def __init__(self, name, does_fencing, does_tennis, does_volleyball):
        self.name = name
        self.does_fencing = does_fencing
        self.does_tennis = does_tennis
        self.does_volleyball = does_volleyball

def get_dual_athletes(athletes):
    ret = []
    for athlete in athletes:
        # Edit this condition
        [Q1v]if [Q1]:
            ret.append(athlete)
    
    return ret 

`;

const description = 
`In a sports event you have three different disciplines: Fencing, Tennis and Volleyball. 
You want to get all athletes that play in exactly two of those sports. Only use boolean expressions in your solution.`;

const queryDescription =
    `Only solve this task with the visual query system.`;

const codeDescription =
    `Only solve this task using the code editor without the visual query system.`;

export function task4(state) {
    
    const task = createTask(state, "Task 3: Athletes", description, queryDescription, codeDescription, code, new Map([
        ["Q1", {
            varString: "",
            expressionString: "((athlete.does_fencing and not athlete.does_tennis) or athlete.does_volleyball)",
            expression: `{"id":88052285,"loc":{"expId":88052285,"min":40,"max":121},"varLoc":{"expId":88052285,"min":13,"max":13},"codeVariableOverride":"","codeQueryOverride":"((athlete.does_fencing and not athlete.does_tennis) or \\n\\tathlete.does_volleyball)","queries":{"_type":"Map","entries":[[0,{"id":0,"content":"Main View","color":"#264653"}],[1,{"id":1,"content":"athlete.does_fencing","color":"#2A9D8F"}],[2,{"id":2,"content":"athlete.does_tennis","color":"#E76F51"}],[3,{"id":3,"content":"athlete.does_volleyball","color":"#457B9D"}]]},"activeView":{"id":0,"name":"Main View","trans":{"x":-176.50000000000017,"y":-21.80000000000002},"scale":1.1,"shapes":{"_type":"Map","entries":[[0,{"shapeId":0,"queryId":1,"shapeType":0,"center":{"x":984.0454545454545,"y":628.2272727272726},"radius":150,"radius2":150}],[1,{"shapeId":1,"queryId":2,"shapeType":0,"center":{"x":993.3181818181823,"y":401.3454545454542},"radius":150,"radius2":150}],[2,{"shapeId":2,"queryId":3,"shapeType":0,"center":{"x":1418.7727272727273,"y":563.1636363636364},"radius":150,"radius2":150}]]},"fragments":{"_type":"Map","entries":[]},"allInactiveFragments":{"_type":"Set","values":[2,3]}},"viewportStates":{"_type":"Map","entries":[[0,{"id":0,"name":"Main View","trans":{"x":-176.50000000000017,"y":-21.80000000000002},"scale":1.1,"shapes":{"_type":"Map","entries":[[0,{"shapeId":0,"queryId":1,"shapeType":0,"center":{"x":984.0454545454545,"y":628.2272727272726},"radius":150,"radius2":150}],[1,{"shapeId":1,"queryId":2,"shapeType":0,"center":{"x":993.3181818181823,"y":401.3454545454542},"radius":150,"radius2":150}],[2,{"shapeId":2,"queryId":3,"shapeType":0,"center":{"x":1418.7727272727273,"y":563.1636363636364},"radius":150,"radius2":150}]]},"fragments":{"_type":"Map","entries":[]},"allInactiveFragments":{"_type":"Set","values":[2,3]}}]]},"hoveringType":1,"hoveredQueries":{"_type":"Set","values":[]},"hoveredShapes":{"_type":"Set","values":[]},"hoveredFragments":{"_type":"Set","values":[0]},"selectedShapes":{"_type":"Set","values":[]},"boxSelectedShapes":{"_type":"Set","values":[]},"selectedQuery":null,"boxSelectionBox":null,"isBoxSelecting":false,"areQueriesVisible":true,"isViewportSelectionVisible":false,"visibleQueryShapeRows":{"_type":"Set","values":[3]}}`
        } ],
    ]));

    return task;
}