import { defaultExpressionState, switchExpression, switchTask } from "../stateManager.js";
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
import { toggleTabList } from "./uiDisplay.js";

const tasks = [taskSandbox, taskTutorial, task8, task9, task10, task4, task7, task1, task2];
export function initializeTasks(state) {
    state.taskGroup0 = new Set();
    state.taskGroup1 = new Set();

    let parity = 0;
    for (const task of tasks) {
        const t = task(state);
        state.tasks.set(t.title, t);

        parity = (parity + 1) % 2;
        if (parity === 0) {
            state.taskGroup0.add(t.title);
        }
        else {
            state.taskGroup1.add(t.title);
        }
    }

    switchTask(state, "Tutorial");
    state.selectedToolTab = toolType.none;
}

export function resetTask(state, taskTitle) {
    if (taskTitle === "Sandbox") {
        const stateId = 0;
        state.activeExpression = defaultExpressionState(state);        
        const newTask = new TaskState("Sandbox", "Use the sandbox to test and play around with the system", "", "", "", new Map([[stateId, state.activeExpression]]));
        newTask.activeExpression = state.activeExpression;
        state.tasks.set("Sandbox", newTask);

        switchTask(state, taskTitle);
        return;
    }
    for (const task of tasks) {
        const t = task(state);
        if (t.title === taskTitle) {
            state.tasks.set(t.title, t);
        }
    }

    switchTask(state, taskTitle);
}


export function updateMenuTab(state, uiDisplay) {
    uiDisplay.menuTab.innerHTML = "";

    if (state.selectedToolTab !== toolType.menu) {

        toggleTabList(uiDisplay.menuTab, false);
        return;
    }

    toggleTabList(uiDisplay.menuTab, true);

    for(const task of state.tasks.values()) {
        addTaskToMenu(state, uiDisplay, task);
    }
}

function addTaskToMenu(state, uiDisplay, task) {
    const listItem = document.createElement('div');
    listItem.classList.add('baseButton');
    listItem.style.padding = '8px';
    listItem.style.alignItems = 'center';
    listItem.style.gap = '8px';
    listItem.style.fontSize = '24px';

    listItem.innerHTML = `<img style="visibility: ${task.hasBeenViewed ? "hidden" : "visible"};" src="./svgs/circle-90.png" alt="Icon" width="12">`;
    const name = document.createElement('div');
    name.innerHTML = task.title;
    listItem.appendChild(name);

    if (state.activeTask.title === task.title) {
        listItem.classList.add('activated');
    }

    uiDisplay.menuTab.appendChild(listItem);

    listItem.onclick = function () {
        switchTask(state, task.title);
    };
}

