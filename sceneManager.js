import { Viewport } from "./viewport/viewport.js";
import { GameState } from "./structs.js";
import { InputHandler } from "./input.js";
import { UIDisplay } from "./UI/uiDisplay.js";
import { updateAll } from "./stateManager.js";
import { CodeDisplay } from "./UI/codeDisplay.js";
import { initializeTasks } from "./UI/menuTab.js";


const viewport = new Viewport();
const uiDisplay = new UIDisplay();
const codeDisplay = new CodeDisplay();
const state = new GameState(viewport, uiDisplay, codeDisplay);

const input = new InputHandler(state);

initializeTasks(state);

updateAll(state);

