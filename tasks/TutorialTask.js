import { createTask } from "../stateManager.js";


const code =
`# Example 1
# Click on the expression to see the viewport in action.
[Q1v]pizza_toppings = [Q1]


`;

const description = 
    `Use the tutorial below to get an introduction into the system.
`;

const queryDescription =
    ``;

const codeDescription =
    ``;

export function taskTutorial(state) {
    
    const task = createTask(state, "Tutorial", description, queryDescription, codeDescription, code, new Map([
        ["Q1", {
            varString: "",
            expressionString: "mozzarella or pineapple",
            expression: `{"id":873094392,"loc":{"expId":873094392,"min":40,"max":60},"varLoc":{"expId":873094392,"min":13,"max":13},"codeVariableOverride":"","codeQueryOverride":"mozzarella or pineapple","queries":{"_type":"Map","entries":[[0,{"id":0,"content":"Main View","color":"#264653"}],[1,{"id":1,"content":"mozzarella","color":"#2A9D8F"}],[2,{"id":2,"content":"pineapple","color":"#E76F51"}]]},"activeView":{"id":0,"name":"Main View","trans":{"x":0,"y":0},"scale":1,"shapes":{"_type":"Map","entries":[[0,{"shapeId":0,"queryId":1,"shapeType":0,"center":{"x":1230.5,"y":588.5},"radius":150,"radius2":150}],[1,{"shapeId":1,"queryId":2,"shapeType":0,"center":{"x":998.5,"y":593.5},"radius":150,"radius2":150}]]},"fragments":{"_type":"Map","entries":[]},"allInactiveFragments":{"_type":"Set","values":[]}},"viewportStates":{"_type":"Map","entries":[[0,{"id":0,"name":"Main View","trans":{"x":0,"y":0},"scale":1,"shapes":{"_type":"Map","entries":[[0,{"shapeId":0,"queryId":1,"shapeType":0,"center":{"x":1230.5,"y":588.5},"radius":150,"radius2":150}],[1,{"shapeId":1,"queryId":2,"shapeType":0,"center":{"x":998.5,"y":593.5},"radius":150,"radius2":150}]]},"fragments":{"_type":"Map","entries":[]},"allInactiveFragments":{"_type":"Set","values":[]}}]]},"hoveringType":1,"hoveredQueries":{"_type":"Set","values":[1]},"hoveredShapes":{"_type":"Set","values":[0]},"hoveredFragments":{"_type":"Set","values":[1]},"selectedShapes":{"_type":"Set","values":[]},"boxSelectedShapes":{"_type":"Set","values":[]},"selectedQuery":null,"boxSelectionBox":null,"isBoxSelecting":false,"areQueriesVisible":true,"isViewportSelectionVisible":false,"visibleQueryShapeRows":{"_type":"Set","values":[2]}}`
        }],
    ]));

    return task;
}