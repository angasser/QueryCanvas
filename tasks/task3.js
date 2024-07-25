import { createTask } from "../stateManager.js";

const code =
`
class Student:
    def __init__(self, name, credit_points, is_bachelor_thesis_finished, semester_amount, has_received_diploma):
        self.name = name
        self.credit_points = credit_points
        self.is_bachelor_thesis_finished = is_bachelor_thesis_finished
        self.semester_amount = semester_amount
        self.has_received_diploma = has_received_diploma

    def is_eligible(self):
        # Change this function
[Q1v]        return [Q1]

def get_eligible_students(students):
    return [student for student in students if student.is_eligible()]

`;

const description = 
`We want to get all students that are eligible for a new bachelor diploma. 
They need at least 180 credit points and have finished their bachelor thesis. However, they must not have used more than 5 years, nor should they have already received their diploma.
`;

const queryDescription =
    `Only solve this task with the visual query system. You need to write the query titles on your own.`;

const codeDescription =
    `Only solve this task using the code editor without the visual query system.`;

export function task3(state) {
    
    const task = createTask(state, "Task 3", description, queryDescription, codeDescription, code, new Map([
        ["Q1", {
            varString: "",
            expressionString: "True",
            expression: `{"id":0,"loc":{"expId":0,"min":0,"max":0},"varLoc":{"expId":0,"min":0,"max":0},"codeVariableOverride":null,"codeQueryOverride":null,"queries":{"_type":"Map","entries":[[0,{"id":0,"content":"Main View","color":"#264653"}]]},"activeView":{"id":0,"name":"Main View","shapes":{"_type":"Map","entries":[]},"fragments":{"_type":"Map","entries":[]},"allInactiveFragments":{"_type":"Set","values":[]}},"viewportStates":{"_type":"Map","entries":[[0,{"id":0,"name":"Main View","shapes":{"_type":"Map","entries":[]},"fragments":{"_type":"Map","entries":[]},"allInactiveFragments":{"_type":"Set","values":[]}}]]},"hoveringType":1,"hoveredQueries":{"_type":"Set","values":[]},"hoveredShapes":{"_type":"Set","values":[]},"hoveredFragments":{"_type":"Set","values":[0]},"selectedShapes":{"_type":"Set","values":[]},"boxSelectedShapes":{"_type":"Set","values":[]},"selectedQuery":{"id":0,"type":"query"},"boxSelectionBox":null,"isBoxSelecting":false,"areQueriesVisible":false,"isViewportSelectionVisible":false,"visibleQueryShapeRows":{"_type":"Set","values":[]}}`
        } ],
    ]));

    return task;
}