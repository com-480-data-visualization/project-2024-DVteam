function processData(csvFile, containerId, title) {
    d3.csv(csvFile).then(data => {
        data.forEach(d => {
            d['distance_ft'] = +d['distance_ft'];
            d['lebron_team_score'] = +d['lebron_team_score'];
            d['opponent_team_score'] = +d['opponent_team_score'];
        });

        const successfulShots = data.filter(d => d['result'].toLowerCase() === "true");

        const shotCounts = d3.rollups(successfulShots, v => ({
            twoPointShots: v.filter(d => d['shot_type'] === '2').length,
            threePointShots: v.filter(d => d['shot_type'] === '3').length
        }), d => d['date']);

        const flatData = shotCounts.map(([date, counts]) => ({
            date,
            twoPointShots: counts.twoPointShots,
            threePointShots: counts.threePointShots
        }));

        console.log(flatData);

        // Calculate total counts for each shot type
        const totalCounts = flatData.reduce((acc, d) => {
            acc.twoPointShots += d.twoPointShots;
            acc.threePointShots += d.threePointShots;
            return acc;
        }, { twoPointShots: 0, threePointShots: 0 });

        // Sort flatData by date
        flatData.sort((a, b) => new Date(a.date) - new Date(b.date));

        // Define SVG dimensions and radius for the rings
        const width = 800;
        const height = 1000;
        const margin = { top: 50, right: 50, bottom: 50, left: 50 };
        const radius = 1.25 * (Math.min(width, height) / 2 - Math.max(margin.top, margin.right, margin.bottom, margin.left));

        // Create SVG element with black background
        const svg = d3.select(containerId).append("svg")
            .attr("width", width)
            .attr("height", height)
            .style("background", "black") // Set background to black
            .append("g")
            .attr("transform", `translate(${width / 2},${height / 2})`);

        //Add title
        svg.append("text")
            .attr("x", 0)
            .attr("y", -height / 2 + 20) // Adjust this value to move the title up or down
            .attr("text-anchor", "middle")
            .attr("fill", "#fff")
            .attr("font-size", "20px")
            .attr("font-weight", "bold")
            .text(title);

        // Create tooltip
        const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip");

        // Define scales
        const angle = d3.scaleTime()
            .domain(d3.extent(flatData, d => new Date(d.date)))
            .range([-0.5 * Math.PI, Math.PI]); // Adjust the range to π to 2.5π

        const shotRadius = d3.scaleOrdinal()
            .domain(["twoPointShots", "threePointShots"])
            .range([radius * 0.5, radius * 0.75]);

        const color = d3.scaleOrdinal()
            .domain(["twoPointShots", "threePointShots"])
            .range(["white", "yellow"]);

        const size = d3.scaleLinear()
            .domain([0, d3.max(flatData, d => Math.max(d.twoPointShots, d.threePointShots))])
            .range([2, 10]); // Adjust the range based on your preference

        // Plot data points
        flatData.forEach(d => {
            ["twoPointShots", "threePointShots"].forEach((shotType) => {
                const circle = svg.append("circle")
                    .attr("cx", Math.cos(angle(new Date(d.date))) * shotRadius(shotType))
                    .attr("cy", Math.sin(angle(new Date(d.date))) * shotRadius(shotType))
                    .attr("r", size(d[shotType]))
                    .attr("fill", color(shotType))
                    .attr("opacity", 0.7);

                circle.on("mouseover", function(event) {
                        d3.select(this).attr("stroke", "yellow").attr("stroke-width", 2);
                        tooltip.style("visibility", "visible")
                            .html(`Date: ${d.date}<br>${shotType === 'twoPointShots' ? '2 Point Shots' : '3 Point Shots'}: ${d[shotType]}`);
                    })
                    .on("mousemove", function(event) {
                        tooltip.style("top", (event.pageY - 10) + "px")
                            .style("left", (event.pageX + 10) + "px");
                    })
                    .on("mouseout", function() {
                        d3.select(this).attr("stroke", null);
                        tooltip.style("visibility", "hidden");
                    });
            });
        });
        // Add annotations at the start of each ring
        const annotations = [
            { label: "2 Point Shots", angle: -0.5 * Math.PI, radius: shotRadius("twoPointShots") },
            { label: "3 Point Shots", angle: -0.5 * Math.PI, radius: shotRadius("threePointShots") }
        ];

        annotations.forEach(d => {
            svg.append("text")
                .attr("x", Math.cos(d.angle) * d.radius)
                .attr("y", Math.sin(d.angle) * d.radius)
                .attr("dy", "0.35em")
                .attr("text-anchor", "middle")
                .attr("fill", "#fff")
                .attr("transform", `translate(-10, 0) rotate(90, ${Math.cos(d.angle) * d.radius}, ${Math.sin(d.angle) * d.radius})`)
                .text(d.label);
        });

        // Add size legend
        const sizeLegend = svg.append("g")
            .attr("transform", `translate(${-(width / 2 - 50)}, ${-(height / 2 - 50)})`); // Adjust this line to move the legend to the top-left

        [0, 5, 10].forEach((d, i) => {
            sizeLegend.append("circle")
                .attr("cx", 10)
                .attr("cy", i * 20)
                .attr("r", size(d))
                .attr("fill", "white")
                .attr("opacity", 0.7);
            sizeLegend.append("text")
                .attr("x", 30)
                .attr("y", 5 + i * 20)
                .attr("fill", "#fff")
                .text(d)
                .attr("alignment-baseline", "middle");
        });

        sizeLegend.append("text")
            .attr("x", 10)
            .attr("y", -10)
            .attr("fill", "#fff")
            .text("Shot Counts")
            .attr("alignment-baseline", "middle")
            .attr("font-weight", "bold");

        // Add histograms at π position for each ring
        const histogramWidth = 10;
        const histogramHeight = 80;
        const histogramOffset = 20; // Offset to move histogram upwards

        const histogramData = [
            { label: "2 Point Shots", count: totalCounts.twoPointShots, radius: shotRadius("twoPointShots") },
            { label: "3 Point Shots", count: totalCounts.threePointShots, radius: shotRadius("threePointShots") }
        ];

        histogramData.forEach((d, i) => {
            const barHeight = d.count / d3.max(histogramData, h => h.count) * histogramHeight;
            svg.append("rect")
                .attr("x", Math.cos(Math.PI) * d.radius - histogramWidth / 2)
                .attr("y", Math.sin(Math.PI) * d.radius - barHeight - histogramOffset)
                .attr("width", histogramWidth)
                .attr("height", barHeight)
                .attr("fill", color(d.label.split(' ')[0].toLowerCase() + 'Shots'));

            svg.append("text")
                .attr("x", Math.cos(Math.PI) * d.radius)
                .attr("y", Math.sin(Math.PI) * d.radius - barHeight - histogramOffset - 5)
                .attr("text-anchor", "middle")
                .attr("fill", "#fff")
                .text(d.count);
        });

    });
}
processData("../Data/2_james_harden_shot_chart_2023.csv", "#chart1", "James Harden 2023 Statistics");
processData("../Data/1_lebron_james_shot_chart_1_2023.csv", "#chart2", "LeBron James 2023 Statistics");
processData("../Data/3_stephen_curry_shot_chart_2023.csv", "#chart3", "Stephen Curry 2023 Statistics");
