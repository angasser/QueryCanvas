import { setHoverFromFragments, setHoverFromShapes, updateAll } from "./stateManager.js";
import { fragmentIterator, hoverType, interactionType, toolType } from "./structs.js";
import { getQueryCircle, toggleTabList } from "./uiDisplay.js";
import { areSetsEqual, getFragmentsFromShapes, getQueriesFromShapes, isIntSubset, isSubset, setElementInteraction, toInt, toShapes } from "./util.js";
import { getAllOverlapping } from "./viewport.js";

export const textQueryType = Object.freeze({
    Normal: 0,
    Query1: 1,
    Query2: 2,
    AllTrue: 3,
    AllFalse: 4,
    AllTrueExcept: 5,
});

function createTextRow(uiDisplay, isIndented = false) {
    const row = document.createElement('div');
    row.style.display = 'flex'; 
    row.style.flexWrap = 'wrap'; 
    row.style.alignItems = 'center'; 
    row.style.justifyContent = 'flex-start'; 
    row.style.gap = '6px';
    row.style.padding = '8px';
    row.style.paddingLeft = isIndented ? '36px' : '8px';
    row.style.fontSize = '24px';
    uiDisplay.resultTab.appendChild(row);
    
    return row;
}

function spawnText(s, parent, bold = false) {
    const text = document.createElement('span');
    if (bold) {
        text.style.fontWeight = 'bold';
    }
    text.style.whiteSpace = 'pre'; // Preserve whitespace
    text.textContent = s;
    parent.appendChild(text);
}

export function updateResultTab(state, uiDisplay) {
    const viewport = state.activeView;

    if (viewport.fragments.size === 0 || state.selectedToolTab !== toolType.result) {
        toggleTabList(uiDisplay.resultTab, false);
        return;
    }

    toggleTabList(uiDisplay.resultTab, true);

    for (const frag of viewport.fragments.keys()) {
        createResultRow(state, uiDisplay, frag);
    }
}

function createResultRow(state, uiDisplay, frag) {
    const viewport = state.activeView;
    const fragShapes = toShapes(frag);
    
    const overlapping = getAllOverlapping(state, fragShapes);
    const ty = getQueryType(state, fragShapes, overlapping);
    if (ty == textQueryType.None)
        return;

    const first = uiDisplay.resultTab.children.length === 0;
    const row = createTextRow(uiDisplay);

    if (first)
    {
        spawnText("If", row);
    }
    else
    {
        spawnText("or if", row);
    }

    if (ty === textQueryType.Normal)
        spawnNormalText(state, fragShapes, overlapping, row);
    else if (ty === textQueryType.Query1) {
        spawnQuery1Text(state, frag, fragShapes[0], row);
    }
    else if (ty === textQueryType.Query2)
        spawnQuery2Text(state, fragShapes[0], fragShapes[1], row);
    else if (ty === textQueryType.AllTrue)
        spawnAllTrueText(state, fragShapes, row);
    else if (ty === textQueryType.AllFalse)
        spawnAllFalseText(state, fragShapes, row);
    else if (ty === textQueryType.AllTrueExcept)
        spawnAllTrueExceptText(state, overlapping, row);

}

function spawnCircle(state, parent, shapeId)
{
    const queryId = state.activeView.shapes.get(shapeId).queryId;
    parent.insertAdjacentHTML('beforeend', getQueryCircle(state, queryId, 32));
}

function spawnAllFalseText(state, l, row)
{
    spawnText("none of", row);

    for (var i = 0; i < l.length; i++)
    {
        spawnCircle(state, row, l[i]);
        if (i < l.length - 2)
            spawnText(",", row);
        if (i == l.length - 2)
            spawnText("and", row);
    }

    spawnText("hold", row);

    setRowHover(state, row,
        state.hoveredShapes.size > 0 && isSubset(state.hoveredShapes, new Set(l)), () => {
        return getFragmentsFromShapes(state, l);
    });
}

function spawnQuery1Text(state, frag, c1, row) {
    spawnCircle(state, row, c1);
        if (state.activeView.allInactiveFragments.has(frag))
            spawnText("does not hold", row);
        else
            spawnText("holds", row);

    setRowHover(state, row,
        state.hoveredShapes.has(c1), () => {
        return new Set([toInt([c1])]);
    });
}

function spawnAllTrueExceptText(state, overlapping, row) {
    const t = getActivesAndInactives(state.activeView, overlapping);
    const active = t.active;
    const inactive = t.inactive;

    spawnText("at least one of", row);

    for (var i = 0; i < overlapping.length; i++)
    {
        spawnCircle(state, row, overlapping[i]);
        if (i < overlapping.length - 2)
            spawnText(",", row);
        if (i == overlapping.length - 2)
            spawnText("or", row);
    }

    spawnText("hold,", row);
    spawnText("except", row, true);

    setRowHover(state, row,
        active.some((x) => state.hoveredFragments.has(x)) && !inactive.some((x) => state.hoveredFragments.has(x)),
        () => {
        return new Set(active);
    });

    for (var i = 0; i < inactive.length; i++){
        const exceptRow = createTextRow(state.uiDisplay, true);
        spawnText("if", exceptRow);
        
        const ind = inactive[i]
        const l = toShapes(ind);
        for (let inte = 0; inte < overlapping.length; inte++)
        {
            if (!l.includes(overlapping[inte]))
                spawnText("not", exceptRow);
            spawnCircle(state, exceptRow, overlapping[inte]);
            if (inte < overlapping.length - 1)
                spawnText("and", exceptRow);
        }

        spawnText("holds", exceptRow);

        setRowHover(state, exceptRow,
            state.hoveredFragments.has(ind), () => {
            return new Set([ind]);
        });
    }

}

function spawnAllTrueText(state, l, row)
{
    spawnText("at least one of", row);

    for (var i = 0; i < l.length; i++)
    {
        spawnCircle(state, row, l[i]);
        if (i < l.length - 2)
            spawnText(",", row);
        if (i == l.length - 2)
            spawnText("or", row);
    }

    spawnText("hold", row);

    setRowHover(state, row,
        state.hoveredShapes.size > 0 && isSubset(state.hoveredShapes, new Set(l)), () => {
        return getFragmentsFromShapes(state, l);
    });
}

function spawnQuery2Text(state, c1, c2, row)
{
    const i1 = toInt([c1]);
    const i2 = toInt([c2]);
    const i12 = toInt([c1, c2]);
    const c1Active = !state.activeView.allInactiveFragments.has(i1);
    const c2Active = !state.activeView.allInactiveFragments.has(i2);
    const bothActive = !state.activeView.allInactiveFragments.has(i12);

    if (c1Active && c2Active && bothActive) {
        spawnCircle(state, row, c1);
        spawnText("or", row);
        spawnCircle(state, row, c2);
        spawnText("or both hold", row);
    } else if (c1Active && c2Active && !bothActive) {
        spawnText("either", row);
        spawnCircle(state, row, c1);
        spawnText("or", row);
        spawnCircle(state, row, c2);
        spawnText("but not both hold", row);
    } else if (c1Active && !c2Active && bothActive) {
        spawnCircle(state, row, c1);
        spawnText("hold", row);
    } else if (!c1Active && c2Active && bothActive) {
        spawnCircle(state, row, c2);
        spawnText("hold", row);
    } else if (c1Active && !c2Active && !bothActive) {
        spawnCircle(state, row, c1);
        spawnText("but not", row);
        spawnCircle(state, row, c2);
        spawnText("hold", row);
    } else if (!c1Active && c2Active && !bothActive) {
        spawnCircle(state, row, c2);
        spawnText("but not", row);
        spawnCircle(state, row, c1);
        spawnText("hold", row);
    } else if (!c1Active && !c2Active && bothActive) {
        spawnCircle(state, row, c2);
        spawnText("and", row);
        spawnCircle(state, row, c1);
        spawnText("hold both together", row);
    } else if (!c1Active && !c2Active && !bothActive) {
        spawnText("neither", row);
        spawnCircle(state, row, c2);
        spawnText("nor", row);
        spawnCircle(state, row, c1);
        spawnText("hold", row);
    }

    setRowHover(state, row,
        state.hoveredShapes.size > 0 && isSubset(state.hoveredShapes, new Set([c1, c2])), () => {
        
        return new Set([i1, i2, i12]);
    });
}

function spawnNormalText(state, l, overlapping, row)
{
    for (let inte = 0; inte < overlapping.length; inte++)
    {
        if (!l.includes(overlapping[inte]))
            spawnText("not", row);
        spawnCircle(state, row, overlapping[inte]);
        if (inte < overlapping.length - 1)
            spawnText("and", row);
    }

    const i = toInt(l);
    if (state.activeView.allInactiveFragments.has(i))
        spawnText("does not hold", row);
    else
        spawnText("holds", row);

    setRowHover(state, row, state.hoveredFragments.has(i), () => {
        return new Set([i]);
    });
}

function setRowHover(state, row, isHighlighted, getHover) {
    if (isHighlighted) {
        setElementInteraction(row, interactionType.Highlighted);
    }
    row.addEventListener('mouseenter', () => {
        const ret = getHover();
        if (state.hoveringType === hoverType.result  &&
            areSetsEqual(state.hoveredFragments, ret))
            return;
        
        setHoverFromFragments(state, ret, hoverType.result);
        updateAll(state);
    });
}


function getQueryType(state, shapeIds, overlapping)
{
    if (shapeIds.length === 0)
        return textQueryType.None;

    const sameSize = overlapping.length === shapeIds.length;
    if (overlapping.length === 1 && sameSize)
        return textQueryType.Query1;

    if (overlapping.length === 2)
    {
        if (!sameSize)
            return textQueryType.None;

        return textQueryType.Query2;
    }

    const t = getActivesAndInactives(state.activeView, overlapping);
    const activeCount = t.active.length;
    const inactiveCount = t.inactive.length;

    if (activeCount === 0)
    {
        if (!sameSize)
            return textQueryType.None;
        return textQueryType.AllFalse;
    }
    if (inactiveCount === 0)
    {
        if (!sameSize)
            return textQueryType.None;
        return textQueryType.AllTrue;
    }
    if (activeCount > inactiveCount && inactiveCount <= 3) {
        if(!sameSize)
            return textQueryType.None;
        return textQueryType.AllTrueExcept;
    }

    if (state.activeView.allInactiveFragments.has(toInt(shapeIds)))
        return textQueryType.None;
    return textQueryType.Normal;
}

function getActivesAndInactives(view, overlapping) {
    const i = toInt(overlapping);
    let inactive = [];
    let active = [];
    for (var ls of view.fragments.keys())
    {
        // Only consider subset of fragments of inters
        if (!isIntSubset(ls, i)) { 
            continue;
        }

        if (view.allInactiveFragments.has(ls))
            inactive.push(ls);
        else
            active.push(ls);
    }

    return { active, inactive };
}
