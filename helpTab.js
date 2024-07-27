import { toolType } from "./structs.js";
import { toggleTabList } from "./uiDisplay.js";



export function updateHelpTab(state, uiDisplay) {
    if (state.selectedToolTab !== toolType.help) {
        uiDisplay.helpTab.innerHTML = '';
        toggleTabList(uiDisplay.helpTab, false);
        return;
    }

    toggleTabList(uiDisplay.helpTab, true);

    if(uiDisplay.helpTab.childElementCount > 0) return;
    const helpContent = document.createElement('div');
    helpContent.style.padding = '32px';
    helpContent.style.fontSize = '24px';
    helpContent.style.maxHeight = 'calc(100vh - 200px)';
    helpContent.style.overflowY = 'auto';
    helpContent.innerHTML = `
        <h2>General</h2>

        <img class="helpImage" src="./imgs/general.png">
        <div>This program tries to make boolean expressions more intuitive.</div>
        <div>It is thought to be used parallel with a code editor, where any textual boolean query can be visualized.</div>
        <div>The system is based on Venn Diagrams where you can simulate query interactions by overalpping them.</div>
        
        <div class="custom-break"></div>
        <h2>Queries</h2>

        <img class="helpImage" src="./imgs/queryBar.png">
        <div>Click on "+" to create a new query.</div>
        <hr>

        <img class="helpImage" src="./imgs/queries.png" >
        <div>Click on the name of the query to change it</div>
        <div>Left button: Toggle shapes</div>
        <div>Middle button: Add shapes</div>
        <div>Right button: Delete query</div>
        <hr>

        <img class="helpImage" src="./imgs/shapeBar.png" style="padding: 8px 0px;">
        <div>Left button: Move camera to this shape in the viewport</div>
        <div>Middle button: Delete shape</div>
        <div>Slider: Change shape size</div>
        <div>Right button: Change shape</div>
        <hr>

        <div class="custom-break"></div>
        <h2>Viewport</h2>

        <img class="helpImage" src="./imgs/viewShapes.png">
        <div>Left click and drag to move the shapes.</div>
        <div>Single left click to invert the fragment.</div>
        <br>
        <div>Right click and drag to move the camera.</div>
        <div>Use the scroll wheel to zoom.</div>
        <hr>


        <img class="helpImage" src="./imgs/viewSelection.png" >
        <div>Left click and drag from an empty space to box select.</div>
        <div>With box selection you can move multiple items.</div>
        <div>You can also create a new variable from the current selection.</div>
        <hr>

        <div class="custom-break"></div>
        <h2>Variables</h2>

        <img class="helpImage" src="./imgs/variable.png">
        <div>Click on the "+" to create a new variable. If you have selected other shapes you will create a variable out of these shapes.</div>
        <hr>

        <img class="helpImage" src="./imgs/variableSelect.png">
        <div>Click on the arrow to show all variables.</div>
        <div>Click on a variable to switch over to it.</div>
        <hr>

        <img class="helpImage" src="./imgs/viewVariable.png">
        <div>Variables can be used the same way as queries.</div>
        <div>Double click on a variable shape to switch to it.</div>
        <hr>

        <div class="custom-break"></div>
        <h2>Tools</h2>

        <img class="helpImage" src="./imgs/tools.png">
        <div>First button: Opens the menu.</div>
        <div>Second button: Opens the tutorial.</div>
        <div>Third button: Opens the code tab.</div>
        <div>Fourth button: Opens the query result tab.</div>
        <div>Fith button: Undoes the last action.</div>
        <div>Fith button: Redoes the last undone action.</div>
        <hr>

        <img class="helpImage" src="./imgs/menuTab.png">
        <div>In the menu you can select the different tasks.</div>
        <div>Tasks that haven't been opened yet are marked with a dot.</div>
        <hr>

        <img class="helpImage" src="./imgs/codeTab.png">
        <div>In the code Tab you can find the task description and the corresponding code.</div>
        <div>You can reset any task. Keep in mind that this will remove all your progress on this task.</div>
        <br>
        <div>Depending on the task you can always either only edit the code or use the query system.</div>
        <div>You can open a boolean expression in the system clicking on the expression or the icon on the left side.</div>
        <hr>

        <img class="helpImage" src="./imgs/result.png">
        <div>This tab gives you textually the current state of the viewport.</div>
        <div>It is probably most helpful when learning the system.</div>
    `;

    uiDisplay.helpTab.appendChild(helpContent);
}