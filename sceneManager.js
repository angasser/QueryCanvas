import { Viewport, updateViewport } from "./viewport.js";
import { GameState, shapeType } from "./structs.js";
import { InputHandler } from "./input.js";
import { UIDisplay,  } from "./uiDisplay.js";
import { updateAll } from "./stateManager.js";
import { CodeDisplay } from "./codeDisplay.js";
import { initializeTasks } from "./menuTab.js";


const viewport = new Viewport();
const uiDisplay = new UIDisplay();
const codeDisplay = new CodeDisplay();
const state = new GameState(viewport, uiDisplay, codeDisplay);

const input = new InputHandler(state);

initializeTasks(state);

updateAll(state);

