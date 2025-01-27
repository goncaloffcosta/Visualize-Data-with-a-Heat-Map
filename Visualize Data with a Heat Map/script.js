const url =
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";

const width = 1200;
const height = 600;
const padding = 80;

fetch(url)
  .then((response) => response.json())
  .then((data) => {
    const baseTemp = data.baseTemperature;
    const dataset = data.monthlyVariance;

    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    // Set up scales
    const xScale = d3
      .scaleBand()
      .domain(dataset.map((d) => d.year))
      .range([padding, width - padding]);

    const yScale = d3
      .scaleBand()
      .domain(months)
      .range([padding, height - padding]);

    const colorScale = d3
      .scaleSequential()
      .domain(d3.extent(dataset, (d) => d.variance))
      .interpolator(d3.interpolateRdYlBu);

    // Create SVG
    const svg = d3
      .select("#heatmap")
      .attr("width", width)
      .attr("height", height);

    // Add X-axis
    const xAxis = d3
      .axisBottom(xScale)
      .tickValues(
        xScale.domain().filter((year) => year % 10 === 0) // Show ticks every 10 years
      )
      .tickFormat(d3.format("d"));

    svg
      .append("g")
      .attr("id", "x-axis")
      .attr("transform", `translate(0, ${height - padding})`)
      .call(xAxis);

    // Add Y-axis
    const yAxis = d3.axisLeft(yScale).tickFormat((d) => d);
    svg
      .append("g")
      .attr("id", "y-axis")
      .attr("transform", `translate(${padding}, 0)`)
      .call(yAxis);

    // Add cells
    svg
      .selectAll(".cell")
      .data(dataset)
      .enter()
      .append("rect")
      .attr("class", "cell")
      .attr("x", (d) => xScale(d.year))
      .attr("y", (d) => yScale(months[d.month - 1]))
      .attr("width", xScale.bandwidth())
      .attr("height", yScale.bandwidth())
      .attr("data-month", (d) => d.month - 1)
      .attr("data-year", (d) => d.year)
      .attr("data-temp", (d) => baseTemp + d.variance)
      .attr("fill", (d) => colorScale(d.variance))
      .on("mouseover", (event, d) => {
        d3.select("#tooltip")
          .style("opacity", 1)
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 20 + "px")
          .attr("data-year", d.year)
          .html(
            `${d.year} - ${months[d.month - 1]}<br>Temp: ${(baseTemp + d.variance).toFixed(
              2
            )}℃<br>Variance: ${d.variance.toFixed(2)}℃`
          );
      })
      .on("mouseout", () => {
        d3.select("#tooltip").style("opacity", 0);
      });

    // Add legend
    const legendWidth = 300;
    const legendHeight = 20;

    const legendScale = d3
      .scaleLinear()
      .domain(d3.extent(dataset, (d) => d.variance))
      .range([0, legendWidth]);

    const legendAxis = d3
      .axisBottom(legendScale)
      .tickFormat((d) => `${(baseTemp + d).toFixed(2)}℃`)
      .ticks(6);

    const legend = svg
      .append("g")
      .attr("id", "legend")
      .attr(
        "transform",
        `translate(${(width - legendWidth) / 2}, ${height - padding + 50})`
      );

    const legendColors = d3
      .range(0, legendWidth, legendWidth / 6)
      .map((d, i, arr) => colorScale(legendScale.invert(d)));

    legend
      .selectAll("rect")
      .data(legendColors)
      .enter()
      .append("rect")
      .attr("x", (d, i) => i * (legendWidth / legendColors.length))
      .attr("y", 0)
      .attr("width", legendWidth / legendColors.length)
      .attr("height", legendHeight)
      .attr("fill", (d) => d);

    legend
      .append("g")
      .attr("transform", `translate(0, ${legendHeight})`)
      .call(legendAxis);
  })
  .catch((error) => console.error("Error loading data:", error));
