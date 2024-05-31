var playerSelect = document.getElementById("player");

function changePlayer3(newPlayer) {
  const svg = d3.select("#chart");
  svg.selectAll("path").remove();

  let csvFile;
  switch (newPlayer) {
    case "james":
      console.log("james");
      csvFile = "Data/james.csv";
      break;
    case "harden":
      console.log("harden");
      csvFile = "Data/harden.csv";
      break;
    case "curry":
      console.log("curry");
      csvFile = "Data/curry.csv";
      break;
    default:
      console.error("Unknown player: ");
      return;
  }

  d3.csv(csvFile, function (loadedData) {
    loadedData.forEach(function (d) {
      var timeComponents = d.time_remaining.split(":");
      var minutes = parseInt(timeComponents[0]);
      var seconds = parseInt(timeComponents[1]);
      var totalTimeInSeconds = minutes * 60 + seconds;

      d.normalized_time = (10 * totalTimeInSeconds) / (12 * 60);

      d.distance = (+d.distance_ft / 40) * 1100 + 205;

      d.result = d.result === "TRUE";
    });

    data = loadedData;
  });
}

var startButton = document.getElementById("startButton");

var timeBar = document.getElementById("timeBar");

var interval;

let data;

document.getElementById("startButton").addEventListener("click", function () {
  console.log("press start");
  const svg = d3.select("#chart");
  svg.selectAll("path").remove();
  if (parseFloat(timeBar.value) == timeBar.max) {
    timeBar.value = timeBar.min;
  }

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
  console.log("updatePaths: start");
  const svg = d3.select("#chart");

  const numPaths = 1;
  const offset = 5;
  const opacityStep = 0.2;

  data.forEach(function (d) {
    if (d.normalized_time * 100 <= timeValue) {
      for (let i = 0; i < numPaths; i++) {
        var path = svg
          .append("path")
          .attr("fill", "none")
          .attr(
            "stroke",
            d.result
              ? "rgba(0, 0, 245, " + opacityStep + ")"
              : "rgba(234, 51, 35, " + opacityStep + ")"
          )
          .attr("stroke-width", 2)
          .attr(
            "d",
            `M${d.distance + i * offset},450 Q${
              (200 + d.distance + i * offset) / 2
            },100 200,180`
          );

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
  console.log("updatePaths: finish");
}
