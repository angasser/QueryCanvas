import { Viewport, updateViewport } from "./viewport.js";
import { GameState, shapeType } from "./structs.js";
import { InputHandler } from "./input.js";
import { UIDisplay,  } from "./uiDisplay.js";
import { createNewQuery, updateAll } from "./stateManager.js";


const viewport = new Viewport();
const uiDisplay = new UIDisplay();
const state = new GameState(viewport, uiDisplay);

const input = new InputHandler(viewport, uiDisplay, state);

updateAll(state);

