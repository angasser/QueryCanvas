import { areBaseTasks, switchTask, updateAll } from "../stateManager.js";
import { toggleVisibility } from "../util.js";
import { resetTask } from "./menuTab.js";

export function initializeFronuUI(state, uiDisplay) {
    toggleVisibility(uiDisplay.frontUIBox, state.testGroup >= 0);

    uiDisplay.frontUITitle.innerHTML = "Boolean Expression Study";
    uiDisplay.frontUIText.innerHTML =
        `You are about to participate in a study on boolean expressions.
        <br>
        Please ensure that you have signed the consent form to participate.
        <br><br>
        Once you're ready, simply press the button below to begin the study.
        <br>
        Be sure to follow the tutorial located at the bottom left of the screen.
        `;
    
    uiDisplay.frontUIButton.innerHTML = "Begin Study";

    uiDisplay.frontUIButton.onclick = () => {
        toggleVisibility(uiDisplay.frontUIBox, false);
    };
}

export function nextIteration(state, uiDisplay) {
    state.testIteration++;
    toggleVisibility(uiDisplay.frontUIBox, state.testGroup >= 0);

    if (state.testIteration === 0) {
        uiDisplay.frontUITitle.innerHTML = "Tasks";
        uiDisplay.frontUIText.innerHTML =
            `Now, you'll be asked to complete a series of tasks involving writing Boolean expressions.
            <br><br>
            You will perform these tasks twice: Once using the system, and once by writing code manually.
            <br>
            ${state.testGroup % 2 === 0 ? "You’ll start with the system version." : "You’ll start with the code version."}
            <br><br>
            Because many tasks could simply be brute-forced, you cannot test whether your solution is correct.
            <br>
            Once you're ready, simply press the button to get the first set of tasks.
            `;
        
        uiDisplay.frontUIButton.innerHTML = "Begin Tasks";
    }
    else if (state.testIteration === 1) {
        uiDisplay.frontUITitle.innerHTML = "Tasks";
        uiDisplay.frontUIText.innerHTML =
            `
            You've completed the first set of tasks.
            <br>
            ${state.testGroup % 2 === 0 ? "Now, please fill out the questions about the system in the survey." : "Now, please fill out the questions about the coding tasks in the survey."}
            <br><br>
            After filling out the survey, you'll do the same tasks again, but in the other format.
            <br>
            ${state.testGroup % 2 === 1 ? "This time, it's with the system version." : "This time, it's with the code version."}
            <br><br>
            Because many tasks could simply be brute-forced, you cannot test whether your solution is correct.
            <br>
            Once you've filled out this part of the survey, simply press the button to get the second set of tasks.
            `;
        
        uiDisplay.frontUIButton.innerHTML = "Begin Tasks";
    }
    else {
        uiDisplay.frontUITitle.innerHTML = "Study Complete";
        uiDisplay.frontUIText.innerHTML =
            `
            Last but not least, please fill out the rest of the survey
            <br>
            and give us any feedback you have about the study.
            <br><br>
            Thank you for participating in the study.
            <br><br><br><br>
            If you want to play around a little bit more, you can return to the system.
            `;
        
        uiDisplay.frontUIButton.innerHTML = "Return";
        state.testGroup = 0;
    }

    for (const task of state.tasks.values()) {
        if (areBaseTasks(task.title))
            continue;
        
        resetTask(state, task.title, false);
    }

    switchTask(state, state.testIteration > 1 ? "Sandbox" : "Task 1: Security system");
}
