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
[Q1v]        if [Q1]:
            ret.append(athlete)
    
    return ret 

`;

const description = 
`In a sports event you have three different disciplines: Fencing, Tennis and Volleyball. 
You want to get all athletes that play in exactly two of those sports. Only use boolean expressions in your solution.`;

const queryDescription =
    `Only solve this task with the visual query system. You need to write the query titles on your own.`;

const codeDescription =
    `Only solve this task using the code editor without the visual query system.`;

export function task4(state) {
    
    const task = createTask(state, "Task 4", description, queryDescription, codeDescription, code, new Map([
        ["Q1", {
            varString: "",
            expressionString: "True",
            expression: `{"id":0,"loc":{"expId":0,"min":0,"max":0},"varLoc":{"expId":0,"min":0,"max":0},"codeVariableOverride":null,"codeQueryOverride":null,"queries":{"_type":"Map","entries":[[0,{"id":0,"content":"Main View","color":"#264653"}]]},"activeView":{"id":0,"name":"Main View","shapes":{"_type":"Map","entries":[]},"fragments":{"_type":"Map","entries":[]},"allInactiveFragments":{"_type":"Set","values":[]}},"viewportStates":{"_type":"Map","entries":[[0,{"id":0,"name":"Main View","shapes":{"_type":"Map","entries":[]},"fragments":{"_type":"Map","entries":[]},"allInactiveFragments":{"_type":"Set","values":[]}}]]},"hoveringType":1,"hoveredQueries":{"_type":"Set","values":[]},"hoveredShapes":{"_type":"Set","values":[]},"hoveredFragments":{"_type":"Set","values":[0]},"selectedShapes":{"_type":"Set","values":[]},"boxSelectedShapes":{"_type":"Set","values":[]},"selectedQuery":{"id":0,"type":"query"},"boxSelectionBox":null,"isBoxSelecting":false,"areQueriesVisible":false,"isViewportSelectionVisible":false,"visibleQueryShapeRows":{"_type":"Set","values":[]}}`
        } ],
    ]));

    return task;
}