import { getActivesAndInactives, getQueryType, textQueryType } from "./resultTab.js";
import { addNewCodeViewport, setHoverFromFragments, updateAll } from "./stateManager.js";
import { hoverType, toolType } from "./structs.js";
import { toggleTabList } from "./uiDisplay.js";
import { areSetsEqual, getFragmentsFromShapes, isSubset, toInt, toShapes } from "./util.js";
import { getAllOverlapping } from "./viewport.js";

const LINE_BREAK_LENGTH = 64;

export class CodeDisplay{
    constructor() {
        this.codeTab = document.querySelector('#codeTab');
        
        this.originalText = "";

        this.selectedExpression = null;

        // this.codeHighlight = [];
        // this.codeViewportHighlight = null;
    }
}

export function initialzeCodeInput(state, codeDisplay) {
    const box = document.getElementById("code");
    box.style.height = `calc(100vh - 128px)`;

    require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.20.0/min/vs' }});

    require(['vs/editor/editor.main'], function() {
        codeDisplay.editor = monaco.editor.create(box, {
            value: "// Type your code here \n t = True",
            language: 'python',
            theme: 'default',
            minimap: { enabled: false },
            fontSize: 20,
            scrollBeyondLastLine: false, 
            scrollbar: {
                vertical: 'auto', 
                horizontal: 'auto', 
                useShadows: false, 
                verticalScrollbarSize: 10, 
                horizontalScrollbarSize: 10,
            },
        });

        codeDisplay.editor.onDidFocusEditorText(() => {
            console.log('Editor is focused');
        });

        // Listener for cursor position changes
        codeDisplay.editor.onDidChangeCursorPosition((e) => {
            const selection = codeDisplay.editor.getSelection();

            const startPosition = { lineNumber: selection.startLineNumber, column: selection.startColumn };
            const endPosition = { lineNumber: selection.endLineNumber, column: selection.endColumn };
            updateCaret(state, codeDisplay, startPosition, endPosition);


        });

        // Listener for text changes in the editor
        codeDisplay.editor.onDidChangeModelContent((e) => {
            console.log('Text in the editor has changed');
        });
        updateCodeTab(state, codeDisplay);
    });
}

export function updateCodeTab(state, codeDisplay) {
    if (!codeDisplay.editor) {
        return;
    }

    if (state.selectedToolTab !== toolType.code) {
        toggleTabList(codeDisplay.codeTab, false);
        return;
    }


    toggleTabList(codeDisplay.codeTab, true);
    return;

    const cursor = codeDisplay.editor.getCursor();
    const content = codeDisplay.editor.getValue();
    const expLength = state.activeTask.activeView.code.length;
    const cursorIndex = posToIndex(content, cursor);
    const possibleStartIndex = Math.max(0, cursorIndex - expLength - 1);

    console.log(cursorIndex, content, content.substring(possibleStartIndex, cursorIndex + expLength),state.activeTask.activeView.code,
        content.substring(possibleStartIndex, cursorIndex + expLength).indexOf(state.activeTask.activeView.code));
    let pos = content.substring(possibleStartIndex, cursorIndex + expLength + 2).indexOf(state.activeTask.activeView.code);
    if (state.activeTask.activeView.code === "") {
        pos = cursorIndex;
    }
    else if (pos === -1) {
        
        return;
    }
    else pos += possibleStartIndex;

    const pre = content.substring(0, pos);
    const post = content.substring(pos + state.currentCodeLength);
    const indent = getIndentation(pre);
    const strs = convertVennToString(state);
    let mid = "";
    let hilightMap = new Map();
    for (let i = 0; i < strs.length; i++) {
        mid = writeMid(state, strs, i, indent, mid, hilightMap);
    }

    if (mid.includes("\n")){
        mid = "(" + mid + ")";
        const t = hilightMap;
        hilightMap = new Map();
        for (const [key, value] of t.entries()) {
            hilightMap.set(key + 1, value);
        }
    }

    state.currentCodeLength = mid.length;
    codeDisplay.editor.setValue(pre + mid + post);

    state.codeHighlight = [];
    const newLineStart = (pre.match(/\n/g) || []).length;
    let newlineCount = newLineStart;
    let midIndex = 0;
    const charCountStart = charsSinceLastBreak(pre);
    let charCount = charCountStart;

    let highlighted = false;
    for (const [key, value] of hilightMap.entries()) {
        while (midIndex < key) {
            charCount++;
            if (content[pos + midIndex] === '\n') {
                newlineCount++;
                charCount = 0;
            }
            midIndex++;
        }

        if (value.isHovered) {
            highlighted = true;
            codeDisplay.editor.markText({line: newlineCount, ch: charCount}, {line: newlineCount, ch: charCount + value.content.length}, {className: "codeHovered"});
        }

        state.codeHighlight.push({
            startPos: { line: newlineCount, ch: charCount },
            endPos: { line: newlineCount, ch: charCount + value.content.length },
            fragments: value.fragments,
        })
    }

    state.codeViewportHighlight = { start: { line: newLineStart, ch: charCountStart }, end: { line: newlineCount, ch: charsSinceLastBreak(pre + mid) } };
    if (!highlighted) {
        codeDisplay.editor.markText(state.codeViewportHighlight.start, state.codeViewportHighlight.end, {className: "codeViewHovered"});
    }

    state.activeTask.activeView.code = mid;
    codeDisplay.editor.setCursor(clampToSelection(cursor, state.codeViewportHighlight));
}
export function convertVennToString(state) {
    const viewport = state.activeTask.activeView.queries;
    const expStrs = [];
    for (const frag of viewport.fragments.keys()) {
        createExpressionString(state, expStrs, frag);
    }

    return expStrs;
}

function updateCaret(state, codeDisplay, startPosition, endPosition) {



    if (codeDisplay.selectedExpression !== null &&
        (!isInSelection(startPosition, codeDisplay.selectedExpression) ||
        !isInSelection(endPosition, codeDisplay.selectedExpression))) {
        
        codeDisplay.selectedExpression = null;
        // Update code
    }

    if (codeDisplay.selectedExpression === null)
        return;

    const intPos = posToIndex(codeDisplay.originalText, position);
    const exp = getBooleanExpression(codeDisplay, intPos);
    
}

function isInSelection(pos, bounds) {
    if (pos.line < bounds.start.line || pos.line > bounds.end.line)
        return false;

    if(pos.line == bounds.start.line && pos.ch < bounds.start.ch)
        return false;
    
    if (pos.line == bounds.end.line && pos.ch > bounds.end.ch)
        return false;
    return true;
}

function getBooleanExpression(codeDisplay, selectedIndex) {
    const content = codeDisplay.originalText;

    
}


function clampToSelection(pos, bounds) {
    if (pos.line < bounds.start.line)
        return {line: bounds.start.line, ch: bounds.start.ch};

    if (pos.line > bounds.end.line)
        return {line: bounds.end.line, ch: bounds.end.ch};

    if (pos.line == bounds.start.line && pos.ch < bounds.start.ch)
        return {line: bounds.start.line, ch: bounds.start.ch};

    if (pos.line == bounds.end.line && pos.ch >= bounds.end.ch)
        return {line: bounds.end.line, ch: bounds.end.ch};

    return pos;

}

function createExpressionString(state, expStrs, frag) {
    const fragShapes = toShapes(frag);
    
    const overlapping = getAllOverlapping(state, fragShapes);
    const ty = getQueryType(state, fragShapes, overlapping);
    if (ty == textQueryType.None)
        return;

    if (ty === textQueryType.Normal)
        normalString(state, fragShapes, overlapping, expStrs);
    else if (ty === textQueryType.Query1) {
        query1String(state, frag, fragShapes[0], expStrs);
    }
    else if (ty === textQueryType.Query2)
        quer2String(state, fragShapes[0], fragShapes[1], expStrs);
    else if (ty === textQueryType.AllTrue)
        allTrueString(state, fragShapes, expStrs);
    else if (ty === textQueryType.AllFalse)
        allFalseString(state, fragShapes, expStrs);
    else if (ty === textQueryType.AllTrueExcept)
        allTrueExceptString(state, overlapping, expStrs);
    

}

function allFalseString(state, l, expStrs)
{
    let str = "";
    for (var i = 0; i < l.length; i++)
    {
        str += "not ";
        str += queryString(state, l[i]);
        if (i < l.length - 1)
            str += " and ";
    }

    const ob = {
        content: str,
        substr: [],
        addParentecies: true,
        isHovered: state.activeTask.hoveredShapes.size > 0 && isSubset(state.activeTask.hoveredShapes, new Set(l)),
        fragments: () => {
            return getFragmentsFromShapes(state, l);
        }
    }
    expStrs.push(ob);
}

function query1String(state, frag, c1, expStrs) {
    let str = "";
    if (state.activeTask.activeView.allInactiveFragments.has(frag))
        str += "not ";

    str += queryString(state, c1);

    const ob = {
        content: str,
        substr: [],
        addParentecies: false,
        isHovered: state.activeTask.hoveredShapes.has(c1),
        fragments: () => {
            return new Set([toInt([c1])]);
        }
    }
    expStrs.push(ob);
}

function allTrueExceptString(state, overlapping, expStrs) {
    const t = getActivesAndInactives(state.activeTask.activeView.queries, overlapping);
    const active = t.active;
    const inactive = t.inactive;
    
    let str = "(";
    for (var i = 0; i < overlapping.length; i++)
    {
        str += queryString(state, overlapping[i]);
        if (i < overlapping.length - 1)
            str += " or ";
    }

    str += ") and not ";

    const ob = {
        content: str,
        substr: [],
        addParentecies: true,
        isHovered: active.some((x) => state.activeTask.activeView.hoveredFragments.has(x)) && !inactive.some((x) => state.activeTask.activeView.hoveredFragments.has(x)),
        fragments: () => {
            return new Set(active);
        }
    }
    expStrs.push(ob);

    for (var i = 0; i < inactive.length; i++){
        let substr = "";
        
        const ind = inactive[i];
        const l = toShapes(ind);
        for (let inte = 0; inte < overlapping.length; inte++)
        {
            if (!l.includes(overlapping[inte]))
                substr += "not ";
            substr += queryString(state, overlapping[inte]);
            if (inte < overlapping.length - 1)
                substr += " and ";
        }

        const subob = {
            content: substr,
            addParentecies: true,
            substr: [],
            isHovered: state.activeTask.activeView.hoveredFragments.has(ind),
            fragments: () => {
                return new Set([ind]);
            }
        }

        ob.substr.push(subob);
    }

}

function allTrueString(state, l, expStrs)
{
    let str = "";

    for (var i = 0; i < l.length; i++)
    {
        str += queryString(state, l[i]);
        if (i < l.length - 1)
            str += " or ";
    }
    
    const ob = {
        content: str,
        substr: [],
        addParentecies: false,
        isHovered: state.activeTask.hoveredShapes.size > 0 && isSubset(state.activeTask.hoveredShapes, new Set(l)),
        fragments: () => {
            return getFragmentsFromShapes(state, l);
        }
    }
    expStrs.push(ob);
}

function quer2String(state, c1, c2, expStrs)
{
    let str = "";
    let hasParen = true;
    const i1 = toInt([c1]);
    const i2 = toInt([c2]);
    const i12 = toInt([c1, c2]);
    const c1Active = !state.activeTask.activeView.allInactiveFragments.has(i1);
    const c2Active = !state.activeTask.activeView.allInactiveFragments.has(i2);
    const bothActive = !state.activeTask.activeView.allInactiveFragments.has(i12);

    if (c1Active && c2Active && bothActive) {
        str += queryString(state, c1);
        str += " or ";
        str += queryString(state, c2);
        hasParen = false;
    } else if (c1Active && c2Active && !bothActive) {
        str += queryString(state, c1);
        str += " != ";
        str += queryString(state, c2);
        hasParen = false;
    } else if (c1Active && !c2Active && bothActive) {
        str += queryString(state, c1);
        hasParen = false;
    } else if (!c1Active && c2Active && bothActive) {
        str += queryString(state, c2);
        hasParen = false;
    } else if (c1Active && !c2Active && !bothActive) {
        str += queryString(state, c1);
        str += " and not ";
        str += queryString(state, c2);
    } else if (!c1Active && c2Active && !bothActive) {
        str += queryString(state, c2);
        str += " and not ";
        str += queryString(state, c1);
    } else if (!c1Active && !c2Active && bothActive) {
        str += queryString(state, c1);
        str += " and ";
        str += queryString(state, c2);
    } else if (!c1Active && !c2Active && !bothActive) {
        str += "not "
        str += queryString(state, c1);
        str += " and not ";
        str += queryString(state, c2);
    }

    const ob = {
        content: str,
        substr: [],
        addParentecies: true,
        isHovered: state.activeTask.hoveredShapes.size > 0 && isSubset(state.activeTask.hoveredShapes, new Set([c1, c2])),
        fragments: () => {
            return new Set([i1, i2, i12]);
        }
    }
    expStrs.push(ob);
}

function normalString(state, l, overlapping, expStrs)
{
    let str = "";
    for (let inte = 0; inte < overlapping.length; inte++)
    {
        if (!l.includes(overlapping[inte]))
            str += "not ";

        str += queryString(state, overlapping[inte]);
        if (inte < overlapping.length - 1)
            str += " and ";
    }

    const i = toInt(l);
    if (state.activeTask.activeView.allInactiveFragments.has(i))
        throw new Error("Fragment is inactive");

    const ob = {
        content: str,
        substr: [],
        addParentecies: true,
        isHovered: state.activeTask.activeView.hoveredFragments.has(i),
        fragments: () => {
            return new Set([i]);
        }
    }
    expStrs.push(ob);
}



function writeMid(state, strs, i, indent, mid, hilightMap) {
    const str = strs[i];
    const paren = strs.length > 1 && str.addParentecies;

    let tStr = "";
    if (paren) {
        tStr = "(";
    }

    tStr += str.content;
    const tHilight = new Map([[paren ? 1 : 0, str]]);
    
    if (str.substr.length > 0) {
        tStr += "(";
        for (let j = 0; j < str.substr.length; j++) {
            tStr = writeMid(state, str.substr, j, indent + 1, tStr, tHilight);
        }
        tStr += ")";
    }

    if (paren) {
        tStr += ")";
    }
    const charCount = charsSinceLastBreak(mid);
    if (charCount > 16 && charCount + tStr.length > LINE_BREAK_LENGTH) {
        mid += newlineIndent(indent + 1);
    }
    if (i < strs.length - 1) {
        tStr += " or ";
    }

    for (const [key, value] of tHilight.entries()) {
        hilightMap.set(key + mid.length, value);
    }
    mid += tStr;

    return mid;
}

function posToIndex(code, pos) {
    let line = 0;
    for (let i = 0; i < code.length; i++) {
        if (line === pos.line) {
            return i + pos.ch;
        }
        if (code[i] === '\n') {
            line++;
        }
    }

    return code.length;
}

function newlineIndent(indent) {
    return '\n' + '\t'.repeat(indent);
}

function charsSinceLastBreak(code) {
    let lastbreak = code.lastIndexOf('\n');
    if (lastbreak === -1) {
        return code.length;
    }
    return code.length - lastbreak - 1;
}

export function getIndentation(code) {
    let lastbreak = code.lastIndexOf('\n');
    lastbreak++;

    let inde = 0;
    while (lastbreak < code.length && code[lastbreak] === '\t') {
        inde++;
        lastbreak++;
    }
    return inde;
}


function splitIntoLines(code) {
    const lines = [];
    let linePosition = 0;
    let activeBrackets = [];
    let activeString = null;

    for (let i = 0; i < code.length; i++) {
        const char = code[i];

        if (char === '"' || char === "'") {
            if (activeString === null) {
                activeString = char;
            }
            else if (activeString === char) {
                activeString = null;
            }
        }

        if(activeString !== null) {
            continue;
        }

        if (char === '(' || char === '{' || char === '[') {
            activeBrackets.push(char);
        }
        else if (char === ')' || char === '}' || char === ']') {
            if(activeBrackets.length === 0 || activeBrackets[activeBrackets.length - 1] !== char) {
                console.log("Mismatched brackets");
                activeBrackets = [];
                continue;
            }
            activeBrackets.pop();
        }

        if (char === '\n' && activeBrackets.length === 0 && activeString === null) {
            lines.push(code.substring(linePosition, i));
            linePosition = i + 1;
        }
    }

    return lines;
}

function queryString(state, shapeId) {
    const queryId = state.activeTask.activeView.shapes.get(shapeId).queryId;
    const query = state.activeTask.queries.get(queryId);
    let modifiedContent = query.content.replace(/ /g, "_");
    modifiedContent = modifiedContent.replace(/[^a-zA-Z0-9_]/g, "");
    return modifiedContent;
}

