var svgString = `
<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
  <polygon points="100,10 40,198 190,78 10,78 160,198"
           style="fill:lime; stroke:purple; stroke-width:5; fill-rule:evenodd;"/>
</svg>`;

// Step 2: Convert the SVG string to a Data URL
var svgBlob = new Blob([svgString], {type: "image/svg+xml;charset=utf-8"});
var url = URL.createObjectURL(svgBlob);

// Step 3: Create an Image object and draw it on the canvas
var img = new Image();
img.onload = function() {
    c.drawImage(img, 0, 0);
}
img.src = url;