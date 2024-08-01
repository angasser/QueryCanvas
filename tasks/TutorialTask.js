import { createTask } from "../stateManager.js";

const code =
`# Example 1
# Click on the expression to see the viewport in action.
[Q1v]pizza_toppings = [Q1]


# Example 2
[Q2v]more_toppings = [Q2]
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
        ["Q2", {
            varString: "",
            expressionString: `((mozzarella and not pineapple and not pepperoni) or \n\t(bacon != cheddar) or \n\t(not mozzarella and not pineapple and pepperoni) or \n\t(not salami and not mozzarella))`,
            expression: `{"id":631264120,"loc":{"expId":631264120,"min":40,"max":205},"varLoc":{"expId":631264120,"min":13,"max":13},"codeVariableOverride":"","codeQueryOverride":"((mozzarella and not pineapple and not pepperoni) or \\n\\t(bacon != cheddar) or \\n\\t(not mozzarella and not pineapple and pepperoni) or \\n\\t(not salami and not mozzarella))","queries":{"_type":"Map","entries":[[0,{"id":0,"content":"Main View","color":"#264653"}],[1,{"id":1,"content":"mozzarella","color":"#2A9D8F"}],[2,{"id":2,"content":"pineapple","color":"#E76F51"}],[3,{"id":3,"content":"bacon","color":"#457B9D"}],[4,{"id":4,"content":"salami","color":"#F4A261"}],[5,{"id":5,"content":"cheddar","color":"#E63946"}],[6,{"id":6,"content":"pepperoni","color":"#A8DADC"}]]},"activeView":{"id":0,"name":"Main View","trans":{"x":191.42857142857156,"y":-138.57142857142924},"scale":1,"shapes":{"_type":"Map","entries":[[0,{"shapeId":0,"queryId":1,"shapeType":0,"center":{"x":928.0714285714284,"y":634.0714285714292},"radius":150,"radius2":150}],[1,{"shapeId":1,"queryId":2,"shapeType":0,"center":{"x":778.0714285714284,"y":484.0714285714288},"radius":150,"radius2":150}],[2,{"shapeId":2,"queryId":3,"shapeType":0,"center":{"x":1175.2142857142835,"y":828.3571428571435},"radius":150,"radius2":150}],[3,{"shapeId":3,"queryId":4,"shapeType":0,"center":{"x":1162.357142857141,"y":188.35714285714315},"radius":150,"radius2":150}],[4,{"shapeId":4,"queryId":5,"shapeType":0,"center":{"x":1393.5,"y":776.5},"radius":150,"radius2":150}],[5,{"shapeId":5,"queryId":6,"shapeType":0,"center":{"x":723.7857142857139,"y":705.4999999999999},"radius":150,"radius2":150}],[6,{"shapeId":6,"queryId":1,"shapeType":0,"center":{"x":969.9107683000002,"y":81.62354382857188},"radius":150,"radius2":150}]]},"fragments":{"_type":"Map","entries":[]},"allInactiveFragments":{"_type":"Set","values":[20,33,35,34,64,72,8,3,2]}},"viewportStates":{"_type":"Map","entries":[[0,{"id":0,"name":"Main View","trans":{"x":191.42857142857156,"y":-138.57142857142924},"scale":1,"shapes":{"_type":"Map","entries":[[0,{"shapeId":0,"queryId":1,"shapeType":0,"center":{"x":928.0714285714284,"y":634.0714285714292},"radius":150,"radius2":150}],[1,{"shapeId":1,"queryId":2,"shapeType":0,"center":{"x":778.0714285714284,"y":484.0714285714288},"radius":150,"radius2":150}],[2,{"shapeId":2,"queryId":3,"shapeType":0,"center":{"x":1175.2142857142835,"y":828.3571428571435},"radius":150,"radius2":150}],[3,{"shapeId":3,"queryId":4,"shapeType":0,"center":{"x":1162.357142857141,"y":188.35714285714315},"radius":150,"radius2":150}],[4,{"shapeId":4,"queryId":5,"shapeType":0,"center":{"x":1393.5,"y":776.5},"radius":150,"radius2":150}],[5,{"shapeId":5,"queryId":6,"shapeType":0,"center":{"x":723.7857142857139,"y":705.4999999999999},"radius":150,"radius2":150}],[6,{"shapeId":6,"queryId":1,"shapeType":0,"center":{"x":969.9107683000002,"y":81.62354382857188},"radius":150,"radius2":150}]]},"fragments":{"_type":"Map","entries":[]},"allInactiveFragments":{"_type":"Set","values":[20,33,35,34,64,72,8,3,2]}}]]},"hoveringType":1,"hoveredQueries":{"_type":"Set","values":[]},"hoveredShapes":{"_type":"Set","values":[]},"hoveredFragments":{"_type":"Set","values":[0]},"selectedShapes":{"_type":"Set","values":[]},"boxSelectedShapes":{"_type":"Set","values":[]},"selectedQuery":null,"boxSelectionBox":null,"isBoxSelecting":false,"areQueriesVisible":true,"isViewportSelectionVisible":false,"visibleQueryShapeRows":{"_type":"Set","values":[]}}`
        }]
    ]));

    return task;
}