var svg = d3.select("#dataviz_area")
var shot = '2'; // 0: missed, 1: scored, 2: all
var path = ''; //default path
var b = 5; // Change this value to adjust the side length of hexagons

// Function to calculate hexagon points
function hexagonPoints(x, y, size) {
    var points = [];
    for (var i = 0; i <= 6; i++) {
        var angle_rad = (Math.PI / 3) * i;
        points.push((x + size * Math.cos(angle_rad)).toFixed(2) + "," + (y + size * Math.sin(angle_rad)).toFixed(2));
    }
    return points.join(" ");
}

function isPointInsideHexagon(px, py, hexagonVertices) {
    var intersections = 0;
    for (var i = 0; i < hexagonVertices.length; i++) {
        var v1 = hexagonVertices[i];
        var v2 = hexagonVertices[(i + 1) % hexagonVertices.length];

        if (((v1.y > py) !== (v2.y > py)) &&
            (px < (v2.x - v1.x) * (py - v1.y) / (v2.y - v1.y) + v1.x)) {
            intersections++;
        }
    }
    return intersections % 2 === 1;
}

//read a csv file from path
function processCSVData(path, shot) {
    d3.csv(path, function (data) {
        //for each hexagon assign the color based on the average of the shots made
        svg.selectAll("polygon").each(function (d, i) {
            var count = 0;
            var sum = 0;
            //obtener los vertices del hexagono
            var hexagonVertices = d3.select(this).attr("points").split(" ").map(function (point) {
                var coords = point.split(",");
                return { x: parseFloat(coords[0]), y: parseFloat(coords[1]) };
            });

            //para cada punto en el csv
            data.forEach(function (d) {
                var left = (parseInt(d.left) + 80) / 1.2;
                var top = (parseInt(d.top) + 55) / 1.2;
                //svg.append("circle").attr("x", d.left).attr("y", d.top).attr("r", 2).style("fill", d.result == "TRUE" ? "green" : "red");
                if (isPointInsideHexagon(left, top, hexagonVertices)) {
                    //si el punto esta dentro del hexagono
                    count++;
                    if (d.color == "green") {
                        sum++;
                    }
                }
            });

            if (count == 0) {
                d3.select(this).style("fill", "white");
            }
            else {
                console.log("Shot value during fill calculation:", shot, typeof shot);
                if (shot === '2') { //all
                    var avg = sum / count;
                    var color = d3.scaleLinear().domain([0, 1]).range(["red", "blue"]);
                    d3.select(this).style("fill", color(avg));
                } else if (shot === '1') { //scored
                    var avg = sum / count;
                    var color = d3.scaleLinear().domain([0, 1]).range(["white", "blue"]);
                    d3.select(this).style("fill", color(avg));
                } else if (shot === '0') { //missed
                    var avg = sum / count;
                    var color = d3.scaleLinear().domain([0, 1]).range(["red", "white"]);
                    d3.select(this).style("fill", color(avg));
                }
            }
        });
    });
}

//listeners

//change player
//document.getElementById('player').addEventListener('change', function () {
function changePlayer1(newPlayer) {
    selectedOptions = newPlayer;
    if (selectedOptions.includes('james')) {
        path = 'Data/james.csv';
    } else if (selectedOptions.includes('curry')) {
        path = 'Data/curry.csv';
    } else if (selectedOptions.includes('harden')) {
        path = 'Data/harden.csv';
    } else if (selectedOptions.includes('empty')) {
        path = '';
    }
    console.log(path);
    console.log(shot);
    svg.selectAll("polygon").style("fill", "white");
    if (path != '') {
        processCSVData(path, shot);
    }
}
//);

//change shoot
document.getElementById('shot').addEventListener('change', function () {
    const selectedOptions = Array.from(this.selectedOptions).map(option => option.value);
    console.log('Selected values:', selectedOptions);
    svg.selectAll("polygon").style("fill", "white");
    if (selectedOptions.includes('score')) {
        shot = '1';
    } else if (selectedOptions.includes('miss')) {
        shot = '0';
    } else if (selectedOptions.includes('all_shots')) {
        shot = '2';
    }
    console.log(path);
    console.log("Updated shot value:", shot, typeof shot);
    processCSVData(path, shot);
});


//slider
const slider = document.getElementById('hexsize');

slider.oninput = function () {
    b = this.value;
    //redraw hexagons
    console.log("Updated hexagon size:", b);
    redrawHexagons();
    processCSVData(path, shot);
    redrawCourt();
}

function redrawHexagons() {
    svg.selectAll("polygon").remove(); // Clear existing hexagons

    var width = 500; // Example width of the area, adjust as needed
    var height = 400; // Example height of the area, adjust as needed
    var numRows = Math.ceil(height / (1.5 * b));
    var numCols = Math.ceil(width / (Math.sqrt(3) * b));
    var startX = -b / 2;
    var startY = -b * Math.sqrt(3) / 2;

    // Append hexagons to the SVG
    for (var row = 0; row < numRows; row++) {
        for (var col = 0; col < numCols; col++) {
            var x = startX + col * Math.sqrt(3) * b;
            var y = startY + row * 1.5 * b + (col % 2) * 0.75 * b;
            svg.append("polygon")
                .attr("points", hexagonPoints(x, y, b))
                .style("fill", '#FFFF');
        }
    }
}

function redrawCourt() {
    svg.append('rect').attr('x', 56.740002).attr('y', 56.689999).attr('width', 427.98999).attr('height', 1.42).style('fill', '#000000');
    svg.append('rect').attr('x', 83.599998).attr('y', 58.110001).attr('width', 1.42).attr('height', 85.18).style('fill', '#000000');
    svg.append('rect').attr('x', 456.28).attr('y', 58.110001).attr('width', 1.42).attr('height', 85.040001).style('fill', '#000000');
    svg.append('path').attr('d', 'm 457.7,143.15 -1.41,-0.1 h -0.01 c -2.47,11.52 -6.04,22.79 -10.67,33.74 -9.56,22.63 -23.26,42.96 -40.7,60.42 -17.44,17.45 -37.75,31.16 -60.36,40.73 -23.41,9.91 -48.28,14.93 -73.91,14.93 -25.64,0 -50.51,-5.02 -73.92,-14.93 -22.61,-9.58 -42.92,-23.28 -60.36,-40.73 -17.44,-17.46 -31.13,-37.79 -40.7,-60.42 -4.61,-10.91 -8.16,-22.13 -10.63,-33.6 h -0.01 l -1.41,0.09 c 18.56,86.32 95.24,151.02 187.03,151.02 91.82,-0.01 168.55,-64.77 187.06,-151.15 z').style('fill', '#000000');
    svg.append('path').attr('d', 'M 338.66,58.11 V 221.24 H 202.6 V 58.11 h 136.06 m 1.41,-1.42 H 201.19 V 222.66 H 340.08 V 56.69 Z').style('fill', '#000000');
    svg.append('path').attr('d', 'm 321.64,222.66 h -1.41 c -0.37,27.05 -22.48,48.94 -49.6,48.94 -27.12,0 -49.23,-21.89 -49.6,-48.94 h -1.41 c 0.37,27.87 23.06,50.36 51.01,50.36 27.95,0 50.64,-22.49 51.01,-50.36 z').style('fill', '#000000');
    svg.append('rect').attr('x', 340.07001).attr('y', 107.76).attr('width', 2.8299999).attr('height', 1.42).style('fill', '#000000');
    svg.append('rect').attr('x', 340.07001).attr('y', 133.28999).attr('width', 2.8299999).attr('height', 11.35).style('fill', '#000000');
    svg.append('rect').attr('x', 340.07001).attr('y', 168.75999).attr('width', 2.8299999).attr('height', 1.42).style('fill', '#000000');
    svg.append('rect').attr('x', 340.07001).attr('y', 194.28999).attr('width', 2.8299999).attr('height', 1.42).style('fill', '#000000');
    svg.append('rect').attr('x', 198.35001).attr('y', 107.76).attr('width', 2.8299999).attr('height', 1.42).style('fill', '#000000');
    svg.append('rect').attr('x', 198.35001).attr('y', 133.28999).attr('width', 2.8299999).attr('height', 11.35).style('fill', '#000000');
    svg.append('rect').attr('x', 198.35001).attr('y', 168.75999).attr('width', 2.8299999).attr('height', 1.42).style('fill', '#000000');
    svg.append('rect').attr('x', 198.35001).attr('y', 194.28999).attr('width', 2.8299999).attr('height', 1.42).style('fill', '#000000');
    svg.append('rect').attr('x', 306.04999).attr('y', 92.160004).attr('width', 1.42).attr('height', 10.64).style('fill', '#000000');
    svg.append('path').attr('d', 'm 307.47,102.79 h -1.42 c -0.37,19.23 -16.11,34.76 -35.42,34.76 -19.31,0 -35.05,-15.53 -35.42,-34.76 h -1.42 c 0.37,20.05 16.72,36.18 36.84,36.18 20.12,0 36.47,-16.13 36.84,-36.18 z').style('fill', '#000000');
    svg.append('rect').attr('x', 233.78999).attr('y', 92.160004).attr('width', 1.42).attr('height', 10.64).style('fill', '#000000');
}

// Initial draw
redrawHexagons();
redrawCourt();
