import { toolType } from "./structs.js";
import { toggleTabList } from "./uiDisplay.js";

export function updateMenuTab(state, uiDisplay) {

    if (state.selectedToolTab !== toolType.menu) {
        toggleTabList(uiDisplay.menuTab, false);
        return;
    }


    toggleTabList(uiDisplay.menuTab, true);
}