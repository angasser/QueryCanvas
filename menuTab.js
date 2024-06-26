import { switchTask } from "./stateManager.js";
import { toolType } from "./structs.js";
import { task1 } from "./tasks/task1.js";
import { toggleTabList } from "./uiDisplay.js";

export function initializeTasks(state) {
    const tasks = [task1];

    for (const task of tasks) {
        const t = task.apply(state);
        state.tasks.set(t.title, t);
    }
}


export function updateMenuTab(state, uiDisplay) {

    if (state.selectedToolTab !== toolType.menu) {
        toggleTabList(uiDisplay.menuTab, false);
        return;
    }

    toggleTabList(uiDisplay.menuTab, true);
    uiDisplay.menuTab.innerHTML = "";

    console.log(state.tasks);
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

    const name = document.createElement('div');
    name.innerHTML = task.title;
    listItem.appendChild(name);

    if (state.activeTask.title === task.title) {
        console.log('activated');
        listItem.classList.add('activated');
    }

    uiDisplay.menuTab.appendChild(listItem);

    listItem.onclick = function () {
        switchTask(state, task.title);

    };
}

