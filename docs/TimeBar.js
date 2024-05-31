//var playerButton = document.getElementById('playerButton');
var playerSelect = document.getElementById('player');
//var playerChoice = document.getElementById('playerChoice');

// player switch
// playerButton.addEventListener('click', function () {
//     playerSelect.style.display = 'block';
// });


//playerSelect.addEventListener('change', function () {
function changePlayer3(newPlayer) {

    //playerChoice.textContent = playerSelect.value;
    //playerSelect.style.display = 'none';

    // if (playerSelect.value === ' - ') {
    // // Clear the playerChoice and data when "-" is selected
    // //playerChoice.textContent = '';
    // data = [];
    // // Call a function to clear the displayed data/visualization
    // clearVisualization();
    // return;
    // }

    let csvFile;
    switch (newPlayer) {
        case 'james':
            console.log('james');
            csvFile = '../Data/1_lebron_james_shot_chart_1_2023.csv';
            break;
        case 'harden':
            console.log('harden');
            csvFile = '../Data/2_james_harden_shot_chart_2023.csv';
            break;
        case 'curry':
            console.log('curry');
            csvFile = '../Data/3_stephen_curry_shot_chart_2023.csv';
            break;
        default:
            console.error('Unknown player: ');
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
}
//);


//TODO: Change this to the css and add a hover and state change
var startButton = document.getElementById("startButton");

// startButton.addEventListener("mousedown", function () {
//     startButton.style.background = "linear-gradient(to bottom, #069798, #0ABAB5)";
// });

// startButton.addEventListener("mouseup", function () {
//     startButton.style.background = "linear-gradient(to bottom, #0ABAB5, #069798)";
// });

var timeBar = document.getElementById("timeBar");

var interval;

// startButton 
let data;

//divide data into the intervals
// function divideData(data) {
//     var intervals = [];
//     window.interval = setInterval(function () {
//         if (parseFloat(0) < timeBar.max) {
//             timeBar.value = parseFloat(timeBar.value) + 0.1;
//             updatePaths(timeBar.value);
//         }
//     }, 100);
// }
document.getElementById("startButton").addEventListener("click", function () {
    console.log('press start')
    const svg = d3.select("#chart");
    svg.selectAll("path").remove();
    svg.selectAll("path").remove();
    if (parseFloat(timeBar.value) == timeBar.max) {
        timeBar.value = timeBar.min;
    }
    console.log("timeBarmax");
    console.log(timeBar.max);

    clearInterval(window.interval);

    var increment = 0.5;

    window.interval = setInterval(function () {
        console.log(timeBar.value);
        if (parseFloat(timeBar.value) < timeBar.max) {
            timeBar.value = parseFloat(timeBar.value) + increment;
            updatePaths(timeBar.value);
        } else {
            clearInterval(window.interval);
        }
    }, 100);

});

function updatePaths(timeValue) {
    console.log("updatePaths: start")
    const svg = d3.select("#chart");

    //svg.selectAll("path").remove();

    const numPaths = 1;  
    const offset = 5;   
    const opacityStep = 0.2;  

    data.forEach(function(d) {
        if (d.normalized_time * 100 <= timeValue) {
            for (let i = 0; i < numPaths; i++) {
                //console.log(d.result); //TRUE , FALSE 
                var path = svg.append("path")
                    .attr("fill", "none")
                    //.attr("stroke", d.color)
                    .attr("stroke", d.result ? "rgba(0, 0, 245, " + ( opacityStep) + ")" : "rgba(234, 51, 35, " + (opacityStep) + ")")
                    .attr("stroke-width", 2)
                    .attr("d", `M${d.distance + i * offset},450 Q${(200 + d.distance + i * offset) / 2},100 200,180`);

                var totalLength = path.node().getTotalLength();

                path
                    .attr("stroke-dasharray", totalLength + " " + totalLength)
                    .attr("stroke-dashoffset", totalLength)
                    .transition()
                        .duration(150)
                        .ease(d3.easeLinear)
                        .attr("stroke-dashoffset", 0);
            }
        }
    });
    console.log("updatePaths: finish")
}
