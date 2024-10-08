import { VARIABLES_VISIBLE } from "../sceneManager.js";
import { toolType } from "../structs.js";

export class Tutorial {
    constructor() {
        this.currentPage = 0;
        this.unlockedPages = 0;

        this.parent = document.querySelector('#tutorialTab');
        this.title = document.querySelector('#tutorialTitle');
        this.icon = document.querySelector('#tutorialIcon');
        this.progress = document.querySelector('#tutorialProgress');
        this.nextButton = document.querySelector('#tutorialNext');
        this.previousButton = document.querySelector('#tutorialPrevious');
        this.content = document.querySelector('#tutorialContent');

        this.nextButton.addEventListener('click', () => nextTutorialPage(this));
        this.previousButton.addEventListener('click', () => previousTutorialPage(this));

        const startPages = [
            {
                title: "Introduction",
                content: "Hello! I'll be your guide through the system.",
                isFinished: null,
            },
            {
                title: "Introduction",
                content: `This purpose of this program is to make boolean expressions easier to use and understand. The program will show you a code editor with embedded visualizations.<br><br>Remember that a boolean variable is a data type that's either <i>true</i> or <i>false</i>. A boolean expression is a combination of boolean variables and operators like <i>and</i>, <i>or</i> or <i>not</i>.`,
                isFinished: null,
            },
            {
                title: "Introduction",
                content: `
                    <div>
                        The system allows you to build any boolean expressions by overlapping the shapes of Venn diagrams.
                    </div>
                    <img class="tutorialImage" src="./imgs/tutVenn.png">`,
                isFinished: null,
            },
            {
                title: "Code Editor",
                content: `
                    <div>
                        First things first, let's navigate to the <i>Code Editor</i>.<br><br> It is the third button in the top left corner.
                    </div>
                    <img class="tutorialImage" src="./imgs/codeBarTab.png">`,
                isFinished: (state) => state.selectedToolTab === toolType.code,
            },
            {
                title: "Code Editor",
                content: `Great! In this tab, you can see the task description of your current exercise. Below, you can find the associated code you need to edit.`,
                isFinished: null,
            },
            {
                title: "Code Editor",
                content: `
                    <div>
                        If you get stuck, you can always reset the code. Drag the double arrows to change the size of the code editor.
                    </div>
                    <img class="tutorialImage" src="./imgs/tut_reset.png">`,
                isFinished: null,
            },
            {
                title: "Code Editor",
                content: `In the code, you'll notice a boolean variable named 'pizza_toppings'. In this tutorial exercise, your task is to select the appropriate pizza topping.`,
                isFinished: null,
            },
            {
                title: "Code Editor",
                content: `
                    <div>
                        To open a boolean expression, click on it directly or select the icon located on the left side.
                    </div>
                    <img class="tutorialImage" src="./imgs/tut_exp1.png">`,
                isFinished: (state) => state.hasExp() && state.activeExpression.queries.size === 3,
            },
            {
                title: "Viewport",
                content: `Great job!<br><br>In the viewport, you can now view the Venn diagram that represents the boolean variable.`,
                isFinished: null,
            },
            {
                title: "Viewport",
                content: `A Venn diagram has different regions. Each region represents a single conjunction. For instance, the intersection of the two circles is "mozzarella *and* pineapple".`,
                isFinished: null,
            },
            {
                title: "Viewport",
                content: `But since all regions of the diagram are enabled, the results is "mozzarella *or* pineapple".`,
                isFinished: null,
            },
            {
                title: "Output tab",
                content: `
                    <div>
                        To better understand the output of this diagram, go to the <i>Output</i> tab located next to the <i>Code Editor</i> tab.
                    </div>
                    <img class="tutorialImage" src="./imgs/tut_outTab.png">`,
                isFinished: (state) => state.selectedToolTab === toolType.result,
            },
            {
                title: "Output tab",
                content: `In this tab, you can view the output of the current expression directly without the rest of the Python code.`,
                isFinished: null,
            },
            {
                title: "Viewport",
                content: `Let's modify the expression a bit.<br><br> As everyone knows, pineapple on pizza is a crime.`,
                isFinished: null,
            },
            {
                title: "Viewport",
                content: `In the Venn diagram there are three different regions: Each variable alone and their intersection. Left-click on the different regions of the diagram to adjust it to "mozzarella but not pineapple".`,
                isFinished: (state) => {
                    if (!state.hasExp())
                        return false;
                    const view = state.activeExpression.activeView;
                    if (view.fragments.size !== 3 || view.allInactiveFragments.size !== 2)
                        return false;
                    return view.allInactiveFragments.has(2) && view.allInactiveFragments.has(3);
                },
            },
            {
                title: "Viewport",
                content: `Nice! Now, let's add another topping to the pizza. <br><br>First, though, let's create a bit of space to work with.`,
                isFinished: null,
            },
            {
                title: "Viewport",
                content: `
                    <div>
                        Hover over the intersection with your mouse. Then, left-click and drag the cursor to move the diagram and create some space.
                    </div>
                    <img class="tutorialImage" src="./imgs/tut_move.png">`,
                isFinished: (state) => {
                    if (!state.hasExp())
                        return false;
                    const view = state.activeExpression.activeView;
                    const shape = view.shapes.get(0);

                    return Math.abs(shape.center.x - 1230.5) > 50 || Math.abs(shape.center.y - 588.5) > 50;
                },
            },

            {
                title: "Add variable",
                content: `
                    <div>
                        Now, click on the '+' icon at the top right of the screen to add a new variable.
                    </div>
                    <img class="tutorialImage" src="./imgs/tut_addQ.png">`,
                isFinished: (state) => {
                    if (!state.hasExp())
                        return false;

                    return state.activeExpression.queries.size === 4;
                },
            },

            {
                title: "Add variable",
                content: `
                    <div>
                        A new variable has appeared.<br><br>Give your variable the same name as a topping that you want to add to your pizza.
                    </div>
                    <img class="tutorialImage" src="./imgs/tut_addQuery.png">`,
                isFinished: null,
            },

            {
                title: "Add variable",
                content: `
                    <div>
                        A new shape has also appeared in the viewport. You can drag it around and position it to interact with the other variables as needed.
                    </div>
                    <img class="tutorialImage" src="./imgs/tut_3q.png">`,
                isFinished: null,
            },

            {
                title: "Add variable",
                content: `
                    <div>
                        If the shapes don't overlap, it semantically represents an 'or' operation, for example <i>(mozzarella and not pineapple) or tomato</i>.
                    </div>
                    <img class="tutorialImage" src="./imgs/tut_sepShapes.png">`,
                isFinished: null,
            },
            {
                title: "Movement",
                content: `If your expression becomes more complex, you may need more space to work with. Test the following: <br><br>(1) Right-click and drag to move the camera.<br><br>(2) Use the mouse wheel to zoom in and out for a better view.`,
                isFinished: (state) => {
                    if (!state.hasExp())
                        return false;
                    const view = state.activeExpression.activeView;
                    return Math.abs(view.trans.x) > 200 || Math.abs(view.trans.y) > 200;
                },
            },
            {
                title: "Shapes",
                content: `
                    <div>
                        In the <i>Boolean variable</i> tab, you'll find an overview of all the variables. First, display all shapes related to "mozzarella" by clicking on the arrow.
                    </div>
                    <img class="tutorialImage" src="./imgs/tut_togShape.png">`,
                isFinished: (state) => {
                    if (!state.hasExp())
                        return false;
                    return state.activeExpression.visibleQueryShapeRows.has(1);
                },
            },
            {
                title: "Shapes",
                content: `Now you can see all shapes associated with the variable "mozzarella". Keep in mind that you view the same variable as different shapes if you have a more difficult expression.<br><br>
                You could also add new shapes by clicking the '+' icon next to each variable.`,
                isFinished: null
            },
            {
                title: "Shapes",
                content: `
                    <div>
                        For each shape, you can adjust its appearance, size, or delete it.<br> If you lose sight of your shape, click on the magnifying glass of the first "mozzarella" shape to find the shape in the viewport.
                    </div>
                    <img class="tutorialImage" src="./imgs/tut_mag.png">`,
                isFinished: (state) => {
                    if (!state.hasExp())
                        return false;
                    const shape = state.activeExpression.activeView.shapes.get(0);
                    const trans = state.activeExpression.activeView.trans;
                    const x = (shape.center.x - window.innerWidth / 2) - 180 + trans.x;
                    const y = (shape.center.y - window.innerHeight / 2) + trans.y;
                    return Math.abs(x) < 50 && Math.abs(y) < 50;
                },
            },
            {
                title: "Selection",
                content: `Great! Now, try selecting the entire group of shapes by left-clicking and dragging from an empty space to box-select them.`,
                isFinished: (state) => {
                    if (!state.hasExp())
                        return false;
                    const exp = state.activeExpression;
                    return exp.boxSelectedShapes != null && exp.boxSelectedShapes.size > 0;
                },
            },

        ];

        const nonVariablePages = [
            {
                title: "Selection",
                content: `With box selection, you can move multiple items at once.`,
                isFinished: null,
            },
        ];

        const variablePages = [
            {
                title: "Selection",
                content: `With box selection, you can move multiple items at once.<br> 
                You can also collapse the boolean variables and create a new variable.`,
                isFinished: null,
            },

            {
                title: "Variable",
                content: `
                    <div>
                        Click on the '+' icon at the center top of the screen to create a new boolean variable.
                     </div>
                    <img class="tutorialImage" src="./imgs/tut_vars.png">`,
                isFinished: (state) => state.hasExp() && state.activeExpression.viewportStates.size > 1,
            },

            {
                title: "Variable",
                content: `Well done! You can name your variable as you wish.<br>`,
                isFinished: null,
            },
            {
                title: "Variable",
                content: `
                    <div>
                        Now, click on the down arrow at the top middle of the screen to view all variables.<br>
                        Then select your newly created variable.
                     </div>
                    <img class="tutorialImage" src="./imgs/tut_varView.png">`,
                isFinished: (state) => {
                    if (!state.hasExp())
                        return false;
                    return state.activeExpression.activeView.id !== 0 && state.activeExpression.selectedQuery === null;
                }
            },
            {
                title: "Variable",
                content: `Here, you can see the shapes you have just collapsed. <br>
                Alternatively, you can create an empty variable and add shapes to it later.`,
                isFinished: null,
            },
            {
                title: "Variable",
                content: `Click on the back arrow to return to the main view.`,
                isFinished: state => state.hasExp() && state.activeExpression.activeView.id === 0,
            },
        ];
    
        const endPages = [
            {
                title: "Code Editor",
                content: `If you check the code editor, you'll see that all your changes have been updated automatically.`,
                isFinished: null,
            },
            {
                title: "General",
                content: `These are already the most important features the system has to offer.`,
                isFinished: null,
            },
            {
                title: "General",
                content: `
                    <div>
                        In the <i>Help</i> tab you can find a summary of this tutorial.
                     </div>
                    <img class="tutorialImage" src="./imgs/tut_help.png">`,
                isFinished: null,
            },
            {
                title: "General",
                content: `
                    <div>
                        In the 'menu' tab you can select the different tasks.
                     </div>
                    <img class="tutorialImage" src="./imgs/tut_menu.png">`,
                isFinished: null,
            },
            {
                title: "General",
                content: ``,
                isFinished: null,
            },
        ];

        const studyPages = [
            {
                title: "Study",
                content: `There is also a sandbox where you can further try out the system.
                <br>In the menu tab, you can now try out the test task.`,
                    
                isFinished: null,
            },
            {
                title: "Study",
                content: `Because many tasks could simply be brute-forced, you cannot test whether your solution is correct. Instead, just try to solve the task as best as you can.`,
                isFinished: null,
            },
            {
                title: "Study",
                content: `After you feel comfortable with the system, you can start the study by clicking "End Tutorial" in the menu tab.`,
                isFinished: null,
            },
        ];

        const endEndPages = [
            {
                title: "General",
                content: `Thank you for your patience! I hope you enjoy using the system.`,
                isFinished: null,
            },
        ];

        this.pages = [
            ...startPages,
            ...(VARIABLES_VISIBLE ? variablePages : nonVariablePages),
            ...endPages,
            ...studyPages,
            ...endEndPages,
        ];

        updateTutorialPage(this);
    }
}

export function nextTutorialPage(tutorial) {
    tutorial.currentPage = Math.min(tutorial.unlockedPages, tutorial.currentPage + 1);

    updateTutorialPage(tutorial);
}

export function previousTutorialPage(tutorial) {
    tutorial.currentPage = Math.max(0, tutorial.currentPage - 1);
    updateTutorialPage(tutorial);
}

export function checkTutorialPageFinished(state, tutorial, first = true) {
    if (state.activeTask.title !== "Tutorial" && (state.testGroup < 0 || state.testIteration !== -1)) {
        tutorial.parent.style.display = 'none';
        return;
    }
    tutorial.parent.style.display = 'block';

    if (tutorial.unlockedPages + 1 >= tutorial.pages.length) {
        return;
    }

    const page = tutorial.pages[tutorial.unlockedPages];
    if (page.isFinished === null || page.isFinished(state)) {
        tutorial.unlockedPages++;

        if (first && page.isFinished !== null && tutorial.currentPage === tutorial.unlockedPages - 1)
            tutorial.currentPage++;
        
        updateTutorialPage(tutorial);
        checkTutorialPageFinished(state, tutorial, false);
    }
}

export function updateTutorialPage(tutorial) {
    const page = tutorial.pages[tutorial.currentPage];

    tutorial.title.innerHTML = page.title;
    tutorial.content.innerHTML = page.content;
    tutorial.progress.innerHTML = `${tutorial.currentPage + 1}/${tutorial.pages.length}`;

    tutorial.previousButton.disabled = tutorial.currentPage === 0;
    tutorial.nextButton.disabled = tutorial.currentPage === tutorial.unlockedPages;

    tutorial.icon.src = tutorial.unlockedPages > tutorial.currentPage ? './svgs/icons8-check-100.png' : './svgs/icons8-checkOff-100.png';
}