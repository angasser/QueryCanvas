export function initBackgroundPattern(canvas, gridSize) {
    const patternCanvas = document.createElement('canvas');
    const pCtx = patternCanvas.getContext('2d');
    patternCanvas.width = gridSize * 4;
    patternCanvas.height = gridSize * 4;

    // Set the colors and line widths
    var lineColor = '#ccc';
    var thickLineColor = '#aaa';
    var regularLineWidth = 1;
    var thickLineWidth = 2;

    // Draw the pattern: 3 regular lines and 1 thick line, both vertically and horizontally
    for (let i = 0; i <= 4; i++) {
        let lineWidth = i % 4 === 0 ? thickLineWidth : regularLineWidth;
        let lineStroke = i % 4 === 0 ? thickLineColor : lineColor;

        // Vertical lines
        pCtx.beginPath();
        pCtx.moveTo(i * gridSize, 0);
        pCtx.lineTo(i * gridSize, patternCanvas.height);
        pCtx.strokeStyle = lineStroke;
        pCtx.lineWidth = lineWidth;
        pCtx.stroke();

        // Horizontal lines
        pCtx.beginPath();
        pCtx.moveTo(0, i * gridSize);
        pCtx.lineTo(patternCanvas.width, i * gridSize);
        pCtx.strokeStyle = lineStroke;
        pCtx.lineWidth = lineWidth;
        pCtx.stroke();
    }

    canvas.backgroundPattern = patternCanvas;
}

export function drawBackground(c, canvas, trans, scale) {
    // Use the created pattern

    const pattern = c.createPattern(canvas.backgroundPattern, 'repeat');

    c.clearRect(0, 0, canvas.mainCanvas.width, canvas.mainCanvas.height);
    c.fillStyle = pattern;
    // Adjust pattern according to trans and scale
    c.save();
    c.translate(trans.x * scale, trans.y * scale);
    c.scale(scale, scale);
    c.fillRect(-trans.x, -trans.y, canvas.backgroundCanvas.width / scale, canvas.backgroundCanvas.height / scale);
    c.restore();
}