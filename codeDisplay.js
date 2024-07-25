import { resetTask } from "./menuTab.js";
import { getActivesAndInactives, getQueryType, textQueryType } from "./resultTab.js";
import { addNewCodeViewport, setHoverFromFragments, switchExpression, switchTask, updateAll } from "./stateManager.js";
import { ExpressionLocation, hoverType, modifyMode, toolType } from "./structs.js";
import { toggleTabList } from "./uiDisplay.js";
import { areSetsEqual, getFragmentsFromShapes, getShapesFromQuery, isSubset, itemTextButton, toInt, toShapes } from "./util.js";
import { getAllOverlapping } from "./viewport.js";

const LINE_BREAK_LENGTH = 64;


export class CodeDisplay{
    constructor() {
        this.codeTab = document.querySelector('#codeTab');
        this.codeTitle = document.querySelector('#codeTitle');
        this.taskDescription = document.querySelector('#taskDescription');
        this.taskTypeDescription = document.querySelector('#taskTypeDescription');
        
        this.originalText = "";
        this.decoratorIds = [];

        this.selectedExpression = null;
        this.glyphDisposables = [];
    }
}

export function initialzeCodeInput(state, codeDisplay) {
    const codeTitleWrap = document.getElementById("codeTitleWrap");
    codeTitleWrap.appendChild(itemTextButton("./svgs/icons8-reset-100.png", "Reset", 32,
        () => {
            const isConfirmed = confirm("Do you want to reset this task? All progress will be lost.");
            if (isConfirmed) {
                resetTask(state, state.activeTask.title);
            }
        }, "Reset the code to the original state."
    ));

    const box = document.getElementById("code");
    const scroll = document.getElementById("codeScroll");
    scroll.style.height = `calc(100vh - 128px)`;
    scroll.style.overflow = 'auto';

    require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.20.0/min/vs' }});

    require(['vs/editor/editor.main'], function() {
        codeDisplay.editor = monaco.editor.create(box, {
            language: 'python',
            theme: 'default',
            glyphMargin: true,
            minimap: { enabled: false },
            fontSize: 18,
            scrollBeyondLastLine: false, 
            scrollbar: {
                vertical: 'hidden', 
                horizontal: 'auto', 
                useShadows: false, 
                alwaysConsumeMouseWheel: false,
                verticalScrollbarSize: 0, 
                horizontalScrollbarSize: 10,
            },
            // wordWrap: 'on',
        });


        window.addEventListener('resize', () => {
            codeDisplay.editor.layout();
        });

        codeDisplay.editor.onDidChangeModelContent((e) => {
            if (state.modifyMode === modifyMode.CodeOnly) {
                const currentContent = codeDisplay.editor.getValue();
                state.activeTask.codeString = currentContent;
            }

            const contentHeight = codeDisplay.editor.getContentHeight();
            codeDisplay.editor.getDomNode().style.height = `${contentHeight}px`;
            codeDisplay.editor.layout();
        });


        updateCodeTab(state, codeDisplay);
    });
}

export function updateCodeTab(state, codeDisplay) {
    if (state.selectedToolTab !== toolType.code) {
        toggleTabList(codeDisplay.codeTab, false);
        return;
    }

    toggleTabList(codeDisplay.codeTab, true);

    if (!codeDisplay.editor) {
        return;
    }
    const task = state.activeTask;
    codeDisplay.codeTitle.innerHTML = task.title;
    codeDisplay.taskDescription.innerHTML = task.taskDesc.replace(/\n/g, '<br>');;
    codeDisplay.taskTypeDescription.innerHTML = (state.modifyMode === modifyMode.QueryOnly ? task.queryDescription : task.codeDescription).replace(/\n/g, '<br>');;

    for(const disposable of codeDisplay.glyphDisposables) 
        disposable.dispose();
    codeDisplay.glyphDisposables = [];
    codeDisplay.editor.deltaDecorations(codeDisplay.decoratorIds, []);
    codeDisplay.decoratorIds = [];

    codeDisplay.editor.updateOptions({ readOnly: state.modifyMode === modifyMode.QueryOnly });
    const position = codeDisplay.editor.getPosition();
    if (codeDisplay.onCaret) {
        codeDisplay.onCaret.dispose();
        codeDisplay.onCaret = null;
    }

    let content = task.codeString;
    if (state.modifyMode !== modifyMode.CodeOnly && state.hasExp()) {
        const exp = state.activeExpression;
        const sp = splitCode(content, exp);
        const expObj = convertExpToString(state, exp);

        let vars = "";
        for (let i = 0; i < expObj.vars.length; i++) {
            const v = expObj.vars[i];
            v.content = v.content + newlineIndent(expObj.indent);
            vars += v.content;
        }

        exp.codeVariableOverride = vars;
        exp.codeQueryOverride = expObj.main.content;
        
        content = sp.pre + vars + sp.mid + expObj.main.content + sp.post;
        codeDisplay.editor.setValue(content);

        setHighlight(codeDisplay, content, expObj, sp, vars);

        task.codeString = content;
        const iLoc = sp.pre.length + vars.length + sp.mid.length;
        exp.loc = new ExpressionLocation(exp.id, iLoc, iLoc + expObj.main.content.length);

        const vLoc = sp.pre.length;
        exp.varLoc = new ExpressionLocation(exp.id, vLoc, vLoc + vars.length);
    }
    else
        codeDisplay.editor.setValue(content);

    codeDisplay.editor.setPosition(position);

    codeDisplay.onCaret = codeDisplay.editor.onDidChangeCursorPosition((e) => {
        updateCaret(state, codeDisplay, e.position);
    });

    if (state.modifyMode !== modifyMode.CodeOnly) {
        for (const exp of task.expressions.values()) {
            addQueryDecorator(state, codeDisplay, content, exp);
        }
    }
}

function addQueryDecorator(state, codeDisplay, content, exp){
    const pos = getPosFromIndex(content, exp.loc.min);
    const isActive = state.activeExpression === exp;
    codeDisplay.decoratorIds += codeDisplay.editor.deltaDecorations([], [
        {
            range: new monaco.Range(pos.line + 1, pos.char + 1, pos.line + 1, pos.char + 1),
            options: {
                isWholeLine: true,
                glyphMarginClassName: isActive ? 'queryGlyphCancel' : 'queryGlyph',
                glyphMarginHoverMessage: { value: isActive ? 'Exit query' : 'Edit query' }
            }
        }
    ]);

    codeDisplay.glyphDisposables.push(codeDisplay.editor.onMouseDown(function (e) {
        if (e.target.type === monaco.editor.MouseTargetType.GUTTER_GLYPH_MARGIN) {
            if (isActive) {
                switchExpression(state, null);
            }
            else
                switchExpression(state, exp);
        }
    }));
}

function getPosFromIndex(str, i) {
    let line = 0;
    let char = 0;

    for (let index = 0; index < i; index++) {
        if (str[index] === '\n') {
            line++;
            char = 0;
        } else {
            char++;
        }
    }

    return { line, char };
}

function setHighlight(codeDisplay, content, midOj, split, vars) {
    codeDisplay.codeHighlight = [];
    const highlights = [];

    const pre = split.pre;
    const varStartInfo = {
        index: pre.length,
        line: (pre.match(/\n/g) || []).length,
        char: charsSinceLastBreak(pre),
    };
    
    let varPosInfo = {
        index: varStartInfo.index,
        line: varStartInfo.line,
        char: varStartInfo.char,
    };

    for (const v of midOj.vars) {
        const oldI = varPosInfo.index;
        addHilight(codeDisplay, highlights, v.hilightMap, content, varPosInfo);
        const i =  oldI + v.content.length;
        varPosInfo = {
            index: i,
            line: varPosInfo.line + 1,
            char: charsSinceLastBreak(content.substring(0, i)),
        }
    }

    const queryStartInfo = {
        index: pre.length + vars.length + split.mid.length,
        line: ((pre + vars + split.mid).match(/\n/g) || []).length,
        char: charsSinceLastBreak(split.mid),
    }

    const posInfo = {
        index: queryStartInfo.index,
        line: queryStartInfo.line,
        char: queryStartInfo.char,
    }

    addHilight(codeDisplay, highlights, midOj.main.hilightMap, content, posInfo);    

    if (vars.length > 0) {
        makeExpSelectionDecorator(highlights, new monaco.Range(
            varStartInfo.line + 1,
            varStartInfo.char + 1,
            varPosInfo.line + 1,
            charsSinceLastBreak(content.substr(0, varStartInfo.index + vars.length - 1)) + 1
        ));
    }

    makeExpSelectionDecorator(highlights, new monaco.Range(
        queryStartInfo.line + 1,
        queryStartInfo.char + 1,
        posInfo.line + 1,
        charsSinceLastBreak(content.substr(0, queryStartInfo.index + midOj.main.content.length)) + 1
    ));

    codeDisplay.decoratorIds += codeDisplay.editor.deltaDecorations([], highlights);
}

function makeExpSelectionDecorator(decorators, range) {
    decorators.push({
        range: range,
        options: {
            className: 'codeExpSelected',
        }
    });
}


function makeHighlightDecorator(decorators, range) {
    decorators.push({
        range: range,
        options: {
            className: 'codeHovered', 
        }
    });
}

function addHilight(codeDisplay, highlightList, highlightMap, content, posInfo) {
    const keyShift = posInfo.index;
    for (const [key, value] of highlightMap.entries()) {
        if (key < 0)
            continue;

        while (posInfo.index < key + keyShift) {
            posInfo.char++;
            if (content[posInfo.index] === '\n') {
                posInfo.line++;
                posInfo.char = 0;
            }
            posInfo.index++;
        }

        if (value.isHovered) {
            makeHighlightDecorator(highlightList, new monaco.Range(
                posInfo.line + 1,
                posInfo.char + 1,
                posInfo.line + 1,
                posInfo.char + value.content.length + 1
            ));
        }

        codeDisplay.codeHighlight.push({
            startPos: { line: posInfo.line, ch: posInfo.char },
            endPos: { line: posInfo.line, ch: posInfo.char + value.content.length },
            fragments: value.fragments,
        })
    }
}

export function convertExpToString(state, exp) {
    let indent = 0;
    let i = exp.varLoc.max;
    while (i < exp.loc.min) {
        if(state.activeTask.codeString[i] === '\t')
            indent++;
        if(state.activeTask.codeString[i] === ' '){
            if ((i - exp.varLoc.max) % 4 == 0)
                indent++;
            i++;
        }
        else break;
    }
    const main = convertVennToString(state, exp.viewportStates.get(0), indent);

    const vars = [];
    const usedVars = new Set();

    for (let i = 0; i < exp.viewportStates.size; i++) {
        for (const [k1, v1] of exp.viewportStates.entries()) {
            if (k1 === 0 || usedVars.has(k1))
                continue;

            let hasDependency = false;
            for (const [k2, v2] of exp.viewportStates.entries()) {
        
                if (k2 === 0 || k2 === k1)
                    continue;
            
                if (getShapesFromQuery(v1, -k2).size > 0 && !usedVars.has(k2)) {
                    hasDependency = true;
                    break;
                }
            }
            
            if (hasDependency) {
                continue;
            }

            usedVars.add(k1);
            const s = convertVennToString(state, v1, indent)
            vars.push(s);
        }
    }

    return {
        indent: indent,
        main: main,
        vars: vars,
    };
}

export function convertVennToString(state, viewport, ind) {
    const strs = [];
    for (const frag of viewport.fragments.keys()) {
        createExpressionString(state, viewport, strs, frag);
    }

    let content = "";
    let hilightMap = new Map();
    for (let i = 0; i < strs.length; i++) {
        content = writeContent(strs, i, ind, content, hilightMap);
    }

    if (content.includes("\n")){
        content = "(" + content + ")";

        shiftHighlight(hilightMap, 1);
    }

    if (content.length === 0)
        content = "True";

    if (viewport.id !== 0) {
        const pre =  nameToCode(viewport.name) + " = ";
        content = pre + content;
        shiftHighlight(hilightMap, pre.length);
    }

    return {
        content: content,
        var: '',
        content: mid,
        hilightMap: hilightMap
    };
}

function updateCaret(state, codeDisplay, startPosition) {
    if(state.modifyMode === modifyMode.CodeOnly){
        return;
    }

    const intPos = posToIndex(state.activeTask.codeString, startPosition);
    const exp = getBooleanExpression(state, intPos);

    if (state.activeExpression === exp)
        return;

    if (state.hasExp() && state.codeQueryOverride !== null) {
        const sp = splitCode(state.activeTask.codeString, state.activeExpression);
    }
    switchExpression(state, exp);
}

function splitCode(code, exp) {
    return {
        pre: code.substring(0, exp.varLoc.min),
        var: code.substring(exp.varLoc.min, exp.varLoc.max),
        mid: code.substring(exp.varLoc.max, exp.loc.min),
        query: code.substring(exp.loc.min, exp.loc.max),
        post: code.substring(exp.loc.max),
    }

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

function getBooleanExpression(state, selectedIndex) {
    for(const exp of state.activeTask.expressions.values()) {
        if (selectedIndex >= exp.loc.min && selectedIndex <= exp.loc.max) {
            return exp;
        }

        if(selectedIndex >= exp.varLoc.min && selectedIndex <= exp.varLoc.max) {
            return exp;
        }
    }

    return null;
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

function createExpressionString(state, view, expStrs, frag) {
    const fragShapes = toShapes(frag);
    
    const overlapping = getAllOverlapping(view, fragShapes);
    const ty = getQueryType(view, fragShapes, overlapping);
    if (ty == textQueryType.None)
        return;

    if (ty === textQueryType.Normal)
        normalString(state, view, fragShapes, overlapping, expStrs);
    else if (ty === textQueryType.Query1) {
        query1String(state, view, frag, fragShapes[0], expStrs);
    }
    else if (ty === textQueryType.Query2)
        quer2String(state, view, fragShapes[0], fragShapes[1], expStrs);
    else if (ty === textQueryType.AllTrue)
        allTrueString(state, view, fragShapes, expStrs);
    else if (ty === textQueryType.AllFalse)
        allFalseString(state, view, fragShapes, expStrs);
    else if (ty === textQueryType.AllTrueExcept)
        allTrueExceptString(state, view, overlapping, expStrs);
    

}

function allFalseString(state, view, l, expStrs)
{
    let str = "";
    for (var i = 0; i < l.length; i++)
    {
        str += "not ";
        str += shapeString(state, view, l[i]);
        if (i < l.length - 1)
            str += " and ";
    }

    const ob = {
        content: str,
        substr: [],
        addParentecies: true,
        isHovered: state.isActiveView(view.id) && state.activeExpression.hoveredShapes.size > 0 && isSubset(state.activeExpression.hoveredShapes, new Set(l)),
        fragments: () => {
            if (!state.isActiveView(view.id))
                return new Set();
            return getFragmentsFromShapes(state, l);
        }
    }
    expStrs.push(ob);
}

function query1String(state, view, frag, c1, expStrs) {
    let str = "";
    if (view.allInactiveFragments.has(frag))
        str += "not ";

    str += shapeString(state, view, c1);

    const ob = {
        content: str,
        substr: [],
        addParentecies: false,
        isHovered: state.isActiveView(view.id) && state.activeExpression.hoveredShapes.has(c1),
        fragments: () => {
            if (!state.isActiveView(view.id))
                return new Set();
            return new Set([toInt([c1])]);
        }
    }
    expStrs.push(ob);
}

function allTrueExceptString(state, view, overlapping, expStrs) {
    const t = getActivesAndInactives(view, overlapping);
    const active = t.active;
    const inactive = t.inactive;
    
    let str = "(";
    for (var i = 0; i < overlapping.length; i++)
    {
        str += shapeString(state, view, overlapping[i]);
        if (i < overlapping.length - 1)
            str += " or ";
    }

    str += ") and not ";

    const ob = {
        content: str,
        substr: [],
        addParentecies: true,
        isHovered: state.isActiveView(view.id) && active.some((x) => state.activeExpression.hoveredFragments.has(x)) && !inactive.some((x) => state.activeExpression.hoveredFragments.has(x)),
        fragments: () => {
            if (!state.isActiveView(view.id))
                return new Set();
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
            substr += shapeString(state, view, overlapping[inte]);
            if (inte < overlapping.length - 1)
                substr += " and ";
        }

        const subob = {
            content: substr,
            addParentecies: true,
            substr: [],
            isHovered: state.isActiveView(view.id) && state.activeExpression.hoveredFragments.has(ind),
            fragments: () => {
            if (!state.isActiveView(view.id))
                return new Set();
                return new Set([ind]);
            }
        }

        ob.substr.push(subob);
    }

}

function allTrueString(state, view, l, expStrs)
{
    let str = "";

    for (var i = 0; i < l.length; i++)
    {
        str += shapeString(state, view, l[i]);
        if (i < l.length - 1)
            str += " or ";
    }
    
    const ob = {
        content: str,
        substr: [],
        addParentecies: false,
        isHovered: state.isActiveView(view.id) && state.activeExpression.hoveredShapes.size > 0 && isSubset(state.activeExpression.hoveredShapes, new Set(l)),
        fragments: () => {
            if (!state.isActiveView(view.id))
                return new Set();
            return getFragmentsFromShapes(state, l);
        }
    }
    expStrs.push(ob);
}

function quer2String(state, view, c1, c2, expStrs)
{
    let str = "";
    let hasParen = true;
    const i1 = toInt([c1]);
    const i2 = toInt([c2]);
    const i12 = toInt([c1, c2]);
    const c1Active = !view.allInactiveFragments.has(i1);
    const c2Active = !view.allInactiveFragments.has(i2);
    const bothActive = !view.allInactiveFragments.has(i12);

    const s1 = shapeString(state, view, c1);
    const s2 = shapeString(state, view, c2);
    if (c1Active && c2Active && bothActive) {
        str += s1;
        str += " or ";
        str += s2;
        hasParen = false;
    } else if (c1Active && c2Active && !bothActive) {
        str += s1;
        str += " != ";
        str += s2;
        hasParen = false;
    } else if (c1Active && !c2Active && bothActive) {
        str += s1;
        hasParen = false;
    } else if (!c1Active && c2Active && bothActive) {
        str += s2;
        hasParen = false;
    } else if (c1Active && !c2Active && !bothActive) {
        str += s1;
        str += " and not ";
        str += s2;
    } else if (!c1Active && c2Active && !bothActive) {
        str += s2;
        str += " and not ";
        str += s1;
    } else if (!c1Active && !c2Active && bothActive) {
        str += s1;
        str += " and ";
        str += s2;
    } else if (!c1Active && !c2Active && !bothActive) {
        str += "not "
        str += s1;
        str += " and not ";
        str += s2;
    }

    const ob = {
        content: str,
        substr: [],
        addParentecies: true,
        isHovered: state.isActiveView(view.id) && state.activeExpression.hoveredShapes.size > 0 && isSubset(state.activeExpression.hoveredShapes, new Set([c1, c2])),
        fragments: () => {
            if (!state.isActiveView(view.id))
                return new Set();
            return new Set([i1, i2, i12]);
        }
    }
    expStrs.push(ob);
}

function normalString(state, view, l, overlapping, expStrs)
{
    let str = "";
    for (let inte = 0; inte < overlapping.length; inte++)
    {
        if (!l.includes(overlapping[inte]))
            str += "not ";

        str += shapeString(state, view, overlapping[inte]);
        if (inte < overlapping.length - 1)
            str += " and ";
    }

    const i = toInt(l);
    if (view.allInactiveFragments.has(i))
        throw new Error("Fragment is inactive");

    const ob = {
        content: str,
        substr: [],
        addParentecies: true,
        isHovered: state.isActiveView(view.id) && state.activeExpression.hoveredFragments.has(i),
        fragments: () => {
            if (!state.isActiveView(view.id))
                return new Set();
            return new Set([i]);
        }
    }
    expStrs.push(ob);
}



function writeContent(strs, i, indent, mid, hilightMap) {
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
            tStr = writeContent(str.substr, j, indent + 1, tStr, tHilight);
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
        if (line === pos.lineNumber - 1) {
            return i + pos.column - 1;
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

export function charsSinceLastBreak(code) {
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

function shiftHighlight(highlightMap, shift) {
    const entries = Array.from(highlightMap.entries()); // Convert to an array to manipulate
    highlightMap.clear(); // Clear the existing map
    for (const [key, value] of entries) {
        highlightMap.set(key + shift, value); // Repopulate with shifted keys
    }
}


function shapeString(state, view, shapeId) {
    const queryId = view.shapes.get(shapeId).queryId;
    return queryString(state, queryId);
}

function queryString(state, queryId) {
    const query = state.activeExpression.queries.get(queryId);
    return nameToCode(query.content);
}

function nameToCode(name) {
    return name;
    // let modifiedContent = name.replace(/ /g, "_");
    // modifiedContent = modifiedContent.replace(/[^a-zA-Z0-9_.]/g, "");
    // return modifiedContent;
}

