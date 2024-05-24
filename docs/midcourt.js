function drawHexagon(svg, points) {
    var hexagon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    hexagon.setAttribute("points", points);
    hexagon.setAttribute("style", "fill: none; stroke: red; stroke-width: 2px;");
    svg.appendChild(hexagon);
}

function calculateHexagonPoints(x, y, size) {
    // Define the angle between each point of the hexagon (in radians)
    var angleIncrement = Math.PI / 3;

    // Initialize an array to store the points
    var points = [];

    // Calculate the coordinates of the other five points
    for (var i = 0; i < 6; i++) {
        var angle = angleIncrement * i;
        var pointX = x + size * Math.cos(angle);
        var pointY = y + size * Math.sin(angle);
        points.push(pointX + "," + pointY); // Format the points as a string
    }

    return points.join(" "); // Join the points into a single string
}

// Example usage:
var centerPointX = 105; // Assuming the center of the SVG is at x = 105
var centerPointY = 148.5; // Assuming the center of the SVG is at y = 148.5
var hexagonSize = 20;

var hexagonPoints = calculateHexagonPoints(centerPointX, centerPointY, hexagonSize);

// Get the SVG element
var svg = document.getElementById("svg1");

// Draw the hexagon
drawHexagon(svg, hexagonPoints);