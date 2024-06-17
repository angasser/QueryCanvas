export function drawBackground(c, canvas, gridSize) {
    var lineColor = '#ccc';
    var thickLineColor = '#aaa';

    // Set the thickness for the regular and every 4th line
    var regularLineWidth = 1;
    var thickLineWidth = 2;

    // Drawing vertical lines
    for (var x = 0; x <= canvas.width; x += gridSize) {
        c.beginPath();
        c.moveTo(x, 0);
        c.lineTo(x, canvas.height);
    
        // Every 4th line is thicker and darker
        if (x % (gridSize * 4) === 0) {
            c.strokeStyle = thickLineColor;
            c.lineWidth = thickLineWidth;
        } else {
            c.strokeStyle = lineColor;
            c.lineWidth = regularLineWidth;
        }
    
        c.stroke();
    }

    // Drawing horizontal lines
    for (var y = 0; y <= canvas.height; y += gridSize) {
        c.beginPath();
        c.moveTo(0, y);
        c.lineTo(canvas.width, y);
    
        // Every 4th line is thicker and darker
        if (y % (gridSize * 4) === 0) {
            c.strokeStyle = thickLineColor;
            c.lineWidth = thickLineWidth;
        } else {
            c.strokeStyle = lineColor;
            c.lineWidth = regularLineWidth;
        }
    
        c.stroke();
    }
}