import { areBaseTasks, defaultExpressionState, switchExpression, switchTask } from "../stateManager.js";
import { TaskState, toolType } from "../structs.js";
import { taskSandbox } from "../tasks/SandboxTask.js";
import { task1 } from "../tasks/task1.js";
import { task10 } from "../tasks/task10.js";
import { task2 } from "../tasks/task2.js";
import { task3 } from "../tasks/task3.js";
import { task4 } from "../tasks/task4.js";
import { task5 } from "../tasks/task5.js";
import { task6 } from "../tasks/task6.js";
import { task7 } from "../tasks/task7.js";
import { task8 } from "../tasks/task8.js";
import { task9 } from "../tasks/task9.js";
import { taskTutorial } from "../tasks/TutorialTask.js";
import { addMetadataToUrl, getMetadataFromUrl } from "../util.js";
import { nextIteration } from "./frontUI.js";
import { toggleTabList } from "./uiDisplay.js";

const tasks = [taskSandbox, taskTutorial, task8, task9, task10, task4, task7, task1, task2];
export function initializeTasks(state) {
    state.tasks = new Map();

    for (const task of tasks) {
        const t = task(state);
        state.tasks.set(t.title, t);
    }

    switchTask(state, "Tutorial");
    state.selectedToolTab = toolType.none;
}

export function resetTask(state, taskTitle, switchOver=true) {
    if (taskTitle === "Sandbox") {
        const stateId = 0;
        state.activeExpression = defaultExpressionState(state);        
        const newTask = new TaskState("Sandbox", "Use the sandbox to test and play around with the system", "", "", "", new Map([[stateId, state.activeExpression]]));
        newTask.activeExpression = state.activeExpression;
        state.tasks.set("Sandbox", newTask);

        if (switchOver) 
            switchTask(state, taskTitle);
        return;
    }
    for (const task of tasks) {
        const t = task(state);
        if (t.title === taskTitle) {
            state.tasks.set(t.title, t);
        }
    }

    if (switchOver)
        switchTask(state, taskTitle);
}


export function updateMenuTab(state, uiDisplay) {
    uiDisplay.menuTab.innerHTML = "";

    if (state.selectedToolTab !== toolType.menu) {

        toggleTabList(uiDisplay.menuTab, false);
        return;
    }

    toggleTabList(uiDisplay.menuTab, true);

    const onlyTutorial = state.testGroup >= 0 && state.testIteration === -1;
    for (const task of state.tasks.values()) {
        if (onlyTutorial && !areBaseTasks(task.title))
            continue;
        addTaskToMenu(state, uiDisplay, task);
    }

    if (state.testGroup < 0 || state.testIteration >= 2) 
        return;

    addMenuRow(
        uiDisplay,
        {
            sprite: "./svgs/icons8-check-100.png",
            visibility: true,
            size: 24
        },
        state.testIteration === -1 ? "End Tutorial" : "Submit tasks",
        () => {
            const isConfirmed = state.testIteration === -1 ?
                confirm("Do you want to end the tutorial?") :
                confirm("Are you sure you want to submit your tasks? You will not be able to make any changes after submitting.");
            if (isConfirmed) {
                nextIteration(state, uiDisplay);
            }
        }
    );
}

function addMenuRow(uiDisplay, spriteInfo, text, onClick) {
    const listItem = document.createElement('div');
    listItem.classList.add('baseButton');
    listItem.style.padding = '8px';
    listItem.style.alignItems = 'center';
    listItem.style.gap = '8px';
    listItem.style.fontSize = '24px';

    listItem.innerHTML = `<img style="visibility: ${spriteInfo.visibility ? "visible" : "hidden"};" src="${spriteInfo.sprite}" alt="Icon" width="${spriteInfo.size}">`;
    const name = document.createElement('div');
    name.innerHTML = text;
    listItem.appendChild(name);

    uiDisplay.menuTab.appendChild(listItem);

    listItem.onclick = onClick;

    return listItem;
}


function addTaskToMenu(state, uiDisplay, task) {
    const listItem = addMenuRow(
        uiDisplay,
        {
            sprite: "./svgs/circle-90.png",
            visibility: !task.hasBeenViewed,
            size: 12
        },
        task.title,
        () => switchTask(state, task.title)
    );

    // const listItem = document.createElement('div');
    // listItem.classList.add('baseButton');
    // listItem.style.padding = '8px';
    // listItem.style.alignItems = 'center';
    // listItem.style.gap = '8px';
    // listItem.style.fontSize = '24px';

    // listItem.innerHTML = `<img style="visibility: ${task.hasBeenViewed ? "hidden" : "visible"};" src="./svgs/circle-90.png" alt="Icon" width="12">`;
    // const name = document.createElement('div');
    // name.innerHTML = task.title;
    // listItem.appendChild(name);

    if (state.activeTask.title === task.title) {
        listItem.classList.add('activated');
    }

    // uiDisplay.menuTab.appendChild(listItem);

    // listItem.onclick = function () {
    //     switchTask(state, task.title);
    // };
}

