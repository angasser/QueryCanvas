import { interactionType, shapeType, toolType } from "./structs.js";

export function drawFragment(ctx, frag) {
    const points = frag.points;
    if (points.length < 3) return; // A polygon needs at least 3 points

    // Set the fill color
    const col = rgbToString(frag.color);
    ctx.fillStyle = frag.isInverted ? createInvertedPattern(ctx, frag.color) : col;
    
    // Calculate and set the border color
    let borderColor = frag.isHovered ? getInteractionColor(interactionType.Highlighted) :
        frag.isInverted ? col : darkColor(frag.color);
    
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 8;

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.closePath();

    // Fill and then stroke for border
    ctx.fill();
    ctx.stroke();
}

function createInvertedPattern(ctx, color) {
    const patternCanvas = document.createElement('canvas');
    const patternContext = patternCanvas.getContext('2d');
    patternCanvas.width = 40;
    patternCanvas.height = 40;

    patternContext.fillStyle = "white";
    patternContext.fillRect(0, 0, patternCanvas.width, patternCanvas.height);
    
    const stripeWidth = 20;
    patternContext.fillStyle = whitenColor(color);

    patternContext.beginPath();
    patternContext.moveTo(0, 0);
    patternContext.lineTo(patternCanvas.width, patternCanvas.height);
    patternContext.lineTo(patternCanvas.width, patternCanvas.height - stripeWidth);
    patternContext.lineTo(stripeWidth, 0);
    patternContext.closePath();
    patternContext.fill();


    patternContext.beginPath();
    patternContext.moveTo(0, patternCanvas.height - stripeWidth);
    patternContext.lineTo(stripeWidth, patternCanvas.height);
    patternContext.lineTo(0, patternCanvas.height);
    patternContext.closePath();
    patternContext.fill();
    
    return ctx.createPattern(patternCanvas, 'repeat');
}

export function areSetsEqual(set1, set2) {
    if (set1.size !== set2.size) return false;
    for (const item of set1) {
        if (!set2.has(item)) return false;
    }
    return true;
}

export function areIterablesEqual(iterable1, iterable2) {
    const array1 = Array.from(iterable1).sort();
    const array2 = Array.from(iterable2).sort();
    
    if (array1.length !== array2.length) return false;
    
    for (let i = 0; i < array1.length; i++) {
        if (array1[i] !== array2[i]) return false;
    }
    
    return true;
}


export function getShapePoints(shape) {
    const r = shape.radius;
    const c = shape.center;
    const points = [];

    if (shape.shapeType === shapeType.Circle) {
        const nPoints = 64;
        for (let i = 0; i < nPoints; i++) {
            const angle = (i / nPoints) * 2 * Math.PI;
            const x = c.x + r * Math.cos(angle);
            const y = c.y + r * Math.sin(angle);
            points.push({ x, y });
        }
    }
    else if (shape.shapeType === shapeType.Rectangle) {
        const r2 = shape.radius2;
        points.push({ x: c.x - r, y: c.y + r2 });
        points.push({ x: c.x - r, y: c.y - r2 });
        points.push({ x: c.x + r, y: c.y - r2 });
        points.push({ x: c.x + r, y: c.y + r2 });
    }
    else if (shape.shapeType === shapeType.Rhombus) {
        points.push({ x: c.x, y: c.y - r });
        points.push({ x: c.x + r, y: c.y });
        points.push({ x: c.x, y: c.y + r });
        points.push({ x: c.x - r, y: c.y });
    }
    return points;
}

export function getShapeBoundingBox(state, shapeIds, padding) {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const shapeId of shapeIds) {
        const shape = state.activeExpression.activeView.shapes.get(shapeId);
        minX = Math.min(minX, shape.center.x - shape.radius);
        maxX = Math.max(maxX, shape.center.x + shape.radius);

        const rad = shape.shapeType === shapeType.Rectangle ? shape.radius2 : shape.radius;
        minY = Math.min(minY, shape.center.y - rad);
        maxY = Math.max(maxY, shape.center.y + rad);
    }


    return {
        minX: minX - padding,
        minY: minY - padding,
        maxX: maxX + padding,
        maxY: maxY + padding,
    };
}

export function getShapesInBox(state, box) {
    const shapes = new Set();
    for (const shape of state.activeExpression.activeView.shapes.values()) {
        const center = shape.center;
        if(center.x >= box.minX && center.x <= box.maxX && center.y >= box.minY && center.y <= box.maxY) {
            shapes.add(shape.shapeId);
        }
    }
    return shapes;
}

export function setElementInteraction(element, interaction) {
    if (interaction === interactionType.Disabled) {
        element.style.color = "#c1c1c1";
    }
    else element.style.color = "black";
    element.style.backgroundColor = getInteractionColor(interaction);
}

export function getInteractionColor(interaction) {
    return interaction === interactionType.None ? "white" :
        interaction === interactionType.Highlighted ? "#cae5ef" :
        interaction === interactionType.Selected ? "#a0c4d1" :
            "#e3e3e3";
}

export function getColor(i) {
    const colorPaletteHex = [
        "#264653", // a dark cyan
        "#2A9D8F", // a teal
        "#E76F51", // a soft red
        "#457B9D", // a medium blue
        "#F4A261", // a light orange
        "#E63946", // a dark red
        "#A8DADC", // a light blue
        "#E9C46A", // a sandy yellow
        "#E9ECEF", // a light gray
        "#1D3557"  // a navy blue
    ];

    if (i >= 0 && i < colorPaletteHex.length)
        return colorPaletteHex[i];
    return getRandomColor();
}

export function getRandomColor() {
    const red = Math.floor(Math.random() * 256); // Generate a random integer between 0 and 255
    const green = Math.floor(Math.random() * 256); // Generate a random integer between 0 and 255
    const blue = Math.floor(Math.random() * 256); // Generate a random integer between 0 and 255

    // Convert the color components to a hexadecimal string and return it
    return '#' + ((1 << 24) + (red << 16) + (green << 8) + blue).toString(16).slice(1);
}

export function getRandomId() {
  return getRandomInt(0, 1000000000);
}

export function getAllOccurrences(content, searchString) {
    let indices = [];
    let startIndex = 0;
    let index;

    while ((index = content.indexOf(searchString, startIndex)) > -1) {
        indices.push(index);
        startIndex = index + searchString.length;
    }

    return indices;
}

export function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getFragmentsFromShapes(state, shapes) {
    const fragments = new Set();

    for (const shape of shapes) {
        const i = toInt([shape]);
        for (const frag of state.activeExpression.activeView.fragments.keys()) {
            if (isIntSubset(i, frag))
                fragments.add(frag);
        }
    }
    return fragments;
}

export function getShapesFromFragments(state, fragments) {
    const shapes = new Set();

    for (const frag of fragments) {
        const l = toShapes(frag);
        for (const s of l) {
            shapes.add(s);
        }
    }
    return shapes;
}

export function isIntSubset(subset, parent) {
    return subset === parent || (((~parent) & subset) === 0);
}

export function getQueriesFromShapes(state, shapes) {
    const queries = new Set();
    for (const shape of shapes) {
        queries.add(state.activeExpression.activeView.shapes.get(shape).queryId);
    }
    return queries;
}

export function getShapesFromQuery(view, queryId) {
    const shapes = new Set();
    for (const shape of view.shapes.values()) {
        if (shape.queryId === queryId) {
            shapes.add(shape.shapeId);
        }
    }
    return shapes;
}

export function isSubset(subset, parent) {
    for (const item of subset) {
        if (!parent.has(item)) return false;
    }
    return true;
}

export function numberToLetter(number) {
    if (number === 0)
        return 'r';
    return String.fromCharCode(96 + number);
}


export function itemButton(imageSrc, size, clicked, hovered, unhovered, visible = true, tooltip = '') {
    const button = document.createElement('button');
    button.innerHTML = `<img src="${imageSrc}" alt="Button Icon">`;
    const img = button.querySelector('img');
    button.classList.add('iconButton');

    button.style.width = `${size}px`;
    button.style.height = `${size}px`;
    button.style.visibility = visible ? 'visible' : 'hidden'; 
    button.style.pointerEvents = visible ? 'auto' : 'none'; 

    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover'; 
    img.style.transition = 'filter 0.3s';

    if (tooltip) {
        button.setAttribute('title', tooltip);
    }

    // Event listeners
    button.addEventListener('mouseenter', () => {
        if (!visible) return; 
        button.style.filter = 'brightness(70%)';
        if (hovered) hovered();
    });

    button.addEventListener('mouseleave', () => {
        if (!visible) return; 
        button.style.filter = 'brightness(100%)';
        if (unhovered) unhovered();
    });

    button.addEventListener('click', (event) => {
        if (!visible) return; 
        button.style.filter = 'brightness(50%)';
        setTimeout(() => img.style.filter = 'brightness(70%)', 100);
        if (clicked) clicked(event);
    });

    return button;
}


export function itemTextButton(imageSrc, text, size, clicked, tooltip = '') {
    const button = document.createElement('button');
    button.style.display = 'flex';
    button.innerHTML = `
        <img src="${imageSrc}" alt="Button Icon">
        <div style="font-size: 16px; font-weight: bold;">${text}</div>
    `;

    const img = button.querySelector('img');

    img.style.width = `${size}px`;
    img.style.height = `${size}px`;
    button.style.border = "2px solid rgb(100, 100, 100)";
    button.style.background = 'white';
    button.style.padding = '0';
    button.style.borderRadius = `calc(0.5 * ${size + 4}px)`;
    button.style.cursor = 'pointer';
    button.style.gap = '8px';
    button.style.alignItems = 'center';
    button.style.padding = '2px';
    button.style.paddingRight = '8px';

    img.style.transition = 'filter 0.3s';

    if (tooltip) {
        button.setAttribute('title', tooltip);
    }

    button.addEventListener('mouseenter', () => {
        button.style.filter = 'brightness(70%)';
    });

    button.addEventListener('mouseleave', () => {
        button.style.filter = 'brightness(100%)';
    });

    button.addEventListener('click', (event) => {
        button.style.filter = 'brightness(50%)';
        setTimeout(() => img.style.filter = 'brightness(70%)', 100);
        if (clicked) clicked(event);
    });

    return button;
}

export function verticalItemTextButton(imageSrc, text, size, clicked) { 
    const wrap = document.createElement('div');
    wrap.style.display = 'flex';
    wrap.style.flexDirection = 'column';
    wrap.style.alignItems = 'center';
    wrap.style.justifyContent = 'center';
    
    const button = itemButton(imageSrc, text, size, clicked);
    button.style.padding = '0';
    wrap.appendChild(button);

    const textNode = document.createElement('span');
    textNode.textContent = text;
    textNode.style.position = 'relative'; 
    textNode.style.top = '-6px'; 
    textNode.style.fontSize = '12px';
    wrap.appendChild(textNode);

    return wrap;
}

export function toInt(shapeIds) {
    let result = 0;
    for (const id of shapeIds) {
        result |= 1 << id;
    }
    return result;
}

export function toShapes(i) {
    const shapes = [];
    for (let j = 0; j < 32; j++) {
        if (i & (1 << j)) {
            shapes.push(j);
        }
    }
    return shapes;
}

export function hexToRgb(hex) {
    const r = parseInt(hex.substring(1, 3), 16);
    const g = parseInt(hex.substring(3, 5), 16);
    const b = parseInt(hex.substring(5, 7), 16);

    return [r, g, b];
}

export function rgbToString(rgb) {
    return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
}

export function colorLerp(color1, color2, t) {
    const r = color1[0] + t * (color2[0] - color1[0]);
    const g = color1[1] + t * (color2[1] - color1[1]);
    const b = color1[2] + t * (color2[2] - color1[2]);
    return [r, g, b];
}

export function darkColor(color) {
    return rgbToString(colorLerp(color, [0, 0, 0], 0.5));
}

export function whitenColor(color) {
    return rgbToString(colorLerp(color, [255, 255, 255], 0.5));
}

export function serializeTaskExpression(exp) {
    function replacer(key, value) {
        if (key === "fragments") // Will be recalculated
            return { _type: 'Map', entries: [] };
        
        if (value instanceof Set) {
            return { _type: 'Set', values: Array.from(value) };
        } else if (value instanceof Map) {
            return { _type: 'Map', entries: Array.from(value.entries()) };
        }
        return value;
    }

    return JSON.stringify(exp, replacer);
}

export function deserializeTaskExpression(serializedExp) {
    function reviver(key, value) {
        if (value && value._type) {
            if (value._type === 'Set') {
                return new Set(value.values);
            } else if (value._type === 'Map') {
                return new Map(value.entries);
            }
        }
        return value;
    }

    const ret = JSON.parse(serializedExp, reviver);
    ret.activeView = null;
    return ret;
}



