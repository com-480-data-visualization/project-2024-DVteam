var playerButton = document.getElementById('playerButton');
var playerSelect = document.getElementById('playerSelect');
var playerChoice = document.getElementById('playerChoice');

// player switch
playerButton.addEventListener('click', function () {
    playerSelect.style.display = 'block';
});


playerSelect.addEventListener('change', function () {
    playerChoice.textContent = playerSelect.value;
    playerSelect.style.display = 'none';

    if (playerSelect.value === ' - ') {
    // Clear the playerChoice and data when "-" is selected
    playerChoice.textContent = '';
    data = [];
    // Call a function to clear the displayed data/visualization
    clearVisualization();
    return;
    }

    let csvFile;
    switch (playerSelect.value) {
        case 'LeBron James':
            csvFile = '../Data/1_lebron_james_shot_chart_1_2023.csv';
            break;
        case 'James Harden':
            csvFile = '../Data/2_james_harden_shot_chart_2023.csv';
            break;
        case 'Stephen Curry':
            csvFile = '../Data/3_stephen_curry_shot_chart_2023.csv';
            break;
        default:
            console.error('Unknown player: ' + playerSelect.value);
            return;
    }

    // use D3.js open csv file 
    d3.csv(csvFile, function(loadedData) {
        loadedData.forEach(function(d) {
            var timeComponents = d.time_remaining.split(":");
            var minutes = parseInt(timeComponents[0]);
            var seconds = parseInt(timeComponents[1]);
            var totalTimeInSeconds = minutes * 60 + seconds;

            // time_remaining 
            d.normalized_time = 10 * totalTimeInSeconds / (12 * 60); // 到 10s
            // distance
            d.distance = ((+d.distance_ft / 40) * 1100) + 205;
            // result
            d.result = d.result === 'TRUE';
        });

        data = loadedData;

    });
});

var startButton = document.getElementById("startButton");

startButton.addEventListener("mousedown", function () {
    startButton.style.background = "linear-gradient(to bottom, #069798, #0ABAB5)";
});

startButton.addEventListener("mouseup", function () {
    startButton.style.background = "linear-gradient(to bottom, #0ABAB5, #069798)";
});

var timeBar = document.getElementById("timeBar");

var interval;

// startButton 
let data;

document.getElementById("startButton").addEventListener("click", function () {
    if (parseFloat(timeBar.value) == timeBar.max) {
        timeBar.value = timeBar.min;
    }

    clearInterval(window.interval);

    var increment = 0.5;

    window.interval = setInterval(function () {
        if (parseFloat(timeBar.value) < timeBar.max) {
            timeBar.value = parseFloat(timeBar.value) + increment;
            updatePaths(timeBar.value);
        } else {
            clearInterval(window.interval);
        }
    }, 100);
});

function updatePaths(timeValue) {
    const svg = d3.select("#chart");

    svg.selectAll("path").remove();

    const numPaths = 3;  
    const offset = 5;   
    const opacityStep = 0.3;  

    data.forEach(function(d) {
        if (d.normalized_time * 100 <= timeValue) {
            for (let i = 0; i < numPaths; i++) {
                //console.log(d.result); //TRUE , FALSE 
                var path = svg.append("path")
                    .attr("fill", "none")
                    //.attr("stroke", d.color)
                    .attr("stroke", d.result ? "rgba(144, 238, 144, " + (1 - i * opacityStep) + ")" : "rgba(173, 216, 230, " + (1 - i * opacityStep) + ")")
                    .attr("stroke-width", 2)
                    .attr("d", `M${d.distance + i * offset},450 Q${(200 + d.distance + i * offset) / 2},100 200,180`);

                var totalLength = path.node().getTotalLength();

                path
                    .attr("stroke-dasharray", totalLength + " " + totalLength)
                    .attr("stroke-dashoffset", totalLength)
                    .transition()
                        .duration(100)
                        .ease(d3.easeLinear)
                        .attr("stroke-dashoffset", 0);
            }
        }
    });
}
