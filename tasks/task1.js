import { createTask } from "../stateManager.js";

const code =
`# This is Task1

# Debug this condition
if Query_1 and not Query_2:
	return True
return False`;

export function task1(state) {
    
    const task = createTask(state, "Task 1", code, new Map([
        ["Query_1 and not Query_2", `{"id":0,"loc":{"expId":0,"min":-1,"max":-1},"queries":{"_type":"Map","entries":[[0,{"id":0,"content":"Main View","color":"#264653"}],[1,{"id":1,"content":"Query 1","color":"#2A9D8F"}],[2,{"id":2,"content":"Query 2","color":"#E76F51"}]]},"activeView":{"id":0,"name":"Main View","fragments":{"_type":"Map","entries":[]},"shapes":{"_type":"Map","entries":[[0,{"shapeId":0,"queryId":1,"shapeType":0,"center":{"x":670,"y":475.5},"radius":150,"radius2":150}],[1,{"shapeId":1,"queryId":2,"shapeType":0,"center":{"x":906,"y":479.5},"radius":150,"radius2":150}]]},"allInactiveFragments":{"_type":"Set","values":[2,3]}},"viewportStates":{"_type":"Map","entries":[[0,{"id":0,"name":"Main View","shapes":{"_type":"Map","entries":[[0,{"shapeId":0,"queryId":1,"shapeType":0,"center":{"x":670,"y":475.5},"radius":150,"radius2":150}],[1,{"shapeId":1,"queryId":2,"shapeType":0,"center":{"x":906,"y":479.5},"radius":150,"radius2":150}]]},"allInactiveFragments":{"_type":"Set","values":[2,3]}}]]},"hoveringType":1,"hoveredQueries":{"_type":"Set","values":[]},"hoveredShapes":{"_type":"Set","values":[]},"hoveredFragments":{"_type":"Set","values":[0]},"selectedShapes":{"_type":"Set","values":[]},"boxSelectedShapes":{"_type":"Set","values":[]},"selectedQuery":null,"boxSelectionBox":null,"isBoxSelecting":false,"areQueriesVisible":true,"isViewportSelectionVisible":false,"visibleQueryShapeRows":{"_type":"Set","values":[2]}}`],
    ]));

    return task;
}