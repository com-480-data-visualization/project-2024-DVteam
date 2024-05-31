function processData(csvFile, containerId, title) {
  d3.csv(csvFile, function (error, data) {
    data.forEach((d) => {
      d["distance_ft"] = +d["distance_ft"];
      d["lebron_team_score"] = +d["lebron_team_score"];
      d["opponent_team_score"] = +d["opponent_team_score"];
    });

    const successfulShots = data.filter(
      (d) => d["result"].toLowerCase() === "true"
    );

    const shotCounts = d3
      .nest()
      .key((d) => d.date)
      .rollup((v) => ({
        twoPointShots: v.filter((d) => d.shot_type === "2").length,
        threePointShots: v.filter((d) => d.shot_type === "3").length,
      }))
      .entries(successfulShots);

    const flatData = shotCounts.map(({ key, value }) => ({
      date: key,
      twoPointShots: value.twoPointShots,
      threePointShots: value.threePointShots,
    }));

    const totalCounts = flatData.reduce(
      (acc, d) => {
        acc.twoPointShots += d.twoPointShots;
        acc.threePointShots += d.threePointShots;
        return acc;
      },
      { twoPointShots: 0, threePointShots: 0 }
    );

    flatData.sort((a, b) => new Date(a.date) - new Date(b.date));

    const width = 800;
    const height = 700;
    const margin = { top: 50, right: 50, bottom: 50, left: 50 };
    const radius =
      1.25 *
      (Math.min(width, height) / 2 -
        Math.max(margin.top, margin.right, margin.bottom, margin.left));

    const svg = d3
      .select(containerId)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    const tooltip = d3.select("body").append("div").attr("class", "tooltip");

    const angle = d3
      .scaleTime()
      .domain(d3.extent(flatData, (d) => new Date(d.date)))
      .range([-0.5 * Math.PI, Math.PI]);

    const shotRadius = d3
      .scaleOrdinal()
      .domain(["twoPointShots", "threePointShots"])
      .range([radius * 0.5, radius * 0.75]);

    const color = d3
      .scaleOrdinal()
      .domain(["twoPointShots", "threePointShots"])
      .range(["blue", "green"]);

    const size = d3
      .scaleLinear()
      .domain([
        0,
        d3.max(flatData, (d) => Math.max(d.twoPointShots, d.threePointShots)),
      ])
      .range([2, 10]);

    flatData.forEach((d) => {
      ["twoPointShots", "threePointShots"].forEach((shotType) => {
        const circle = svg
          .append("circle")
          .attr("cx", Math.cos(angle(new Date(d.date))) * shotRadius(shotType))
          .attr("cy", Math.sin(angle(new Date(d.date))) * shotRadius(shotType))
          .attr("r", size(d[shotType]))
          .attr("fill", color(shotType))
          .attr("opacity", 0.7);

        circle
          .on("mouseover", function (event) {
            d3.select(this).attr("stroke", "yellow").attr("stroke-width", 2);
            tooltip
              .style("visibility", "visible")
              .html(
                `Date: ${d.date}<br>${
                  shotType === "twoPointShots"
                    ? "2 Point Shots"
                    : "3 Point Shots"
                }: ${d[shotType]}`
              );
          })
          .on("mousemove", function (event) {
            tooltip
              .style("top", d3.event.pageY - 10 + "px")
              .style("left", d3.event.pageX + 10 + "px");
          })
          .on("mouseout", function () {
            d3.select(this).attr("stroke", null);
            tooltip.style("visibility", "hidden");
          });
      });
    });

    const annotations = [
      {
        label: "2 Points",
        angle: -0.5 * Math.PI,
        radius: shotRadius("twoPointShots"),
      },
      {
        label: "3 Points",
        angle: -0.5 * Math.PI,
        radius: shotRadius("threePointShots"),
      },
    ];

    annotations.forEach((d) => {
      svg
        .append("text")
        .attr("x", Math.cos(d.angle) * d.radius - 45)
        .attr("y", Math.sin(d.angle) * d.radius)
        .attr("dy", "0.35em")
        .attr("text-anchor", "middle")
        .attr("fill", "black")
        .text(d.label);
    });

    const sizeLegend = svg
      .append("g")
      .attr(
        "transform",
        `translate(${-(width / 2 - 50)}, ${-(height / 2 - 50)})`
      );

    [0, 5, 10].forEach((d, i) => {
      sizeLegend
        .append("circle")
        .attr("cx", 10)
        .attr("cy", i * 20)
        .attr("r", size(d))
        .attr("fill", "black")
        .attr("opacity", 0.7);
      sizeLegend
        .append("text")
        .attr("x", 30)
        .attr("y", 5 + i * 20)
        .attr("fill", "black")
        .text(d)
        .attr("alignment-baseline", "middle");
    });

    sizeLegend
      .append("text")
      .attr("x", 10)
      .attr("y", -10)
      .attr("fill", "black")
      .text("Shot Counts")
      .attr("alignment-baseline", "middle")
      .attr("font-weight", "bold");

    const histogramWidth = 10;
    const histogramHeight = 80;
    const histogramOffset = 20;

    const histogramData = [
      {
        label: "2 Point Shots",
        count: totalCounts.twoPointShots,
        radius: shotRadius("twoPointShots"),
      },
      {
        label: "3 Point Shots",
        count: totalCounts.threePointShots,
        radius: shotRadius("threePointShots"),
      },
    ];

    histogramData.forEach((d, i) => {
      const barHeight =
        (d.count / d3.max(histogramData, (h) => h.count)) * histogramHeight;
      svg
        .append("rect")
        .attr("x", Math.cos(Math.PI) * d.radius - histogramWidth / 2)
        .attr("y", Math.sin(Math.PI) * d.radius - barHeight - histogramOffset)
        .attr("width", histogramWidth)
        .attr("height", barHeight)
        .attr("fill", color(d.label.split(" ")[0].toLowerCase() + "Shots"));

      svg
        .append("text")
        .attr("x", Math.cos(Math.PI) * d.radius)
        .attr(
          "y",
          Math.sin(Math.PI) * d.radius - barHeight - histogramOffset - 5
        )
        .attr("text-anchor", "middle")
        .attr("fill", "black")
        .text(d.count);
    });
  });
}

function clearChart(containerId) {
  d3.select(containerId).selectAll("*").remove();
}

function changePlayer2(newPlayer) {
  clearChart("#chart1");
  clearChart("#chart2");
  clearChart("#chart3");

  if (newPlayer == "james") {
    processData("Data/james.csv", "#chart2", "LeBron James 2023 Statistics");
  } else if (newPlayer == "curry") {
    processData("Data/curry.csv", "#chart3", "Stephen Curry 2023 Statistics");
  } else if (newPlayer == "harden") {
    processData("Data/harden.csv", "#chart1", "James Harden 2023 Statistics");
  } else if (newPlayer == "empty") {
  }
}
