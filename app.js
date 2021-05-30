// @TODO: YOUR CODE HERE!
// D3-Challenge - Data Journalism and D3 w/ Bonus

// Wrap code inside a function that automatically resizes the chart
function makeResponsive() {

    // If SVG Area is not empty when browser loads, remove & replace with resized version of chart
    var svgArea = d3.select("body").select("svg");
    
    // Clear SVG if not empty
    if (!svgArea.empty()) {
        svgArea.remove();
    }
    
    // Setup Chart Parameters/Dimensions/Margins
    var svgWidth = 960;
    var svgHeight = 600;

    var margin = {
      top: 20,
      right: 40,
      bottom: 80,
      left: 100
    };

    var width = svgWidth - margin.left - margin.right;
    var height = svgHeight - margin.top - margin.bottom;

    // Creat a SVG wrapper, append a SVG group that will hold our scatter plot,
    // and shift the latter by the left and top margins
    var svg = d3
      .select("#scatter")
      .append("svg")
      .attr("width", svgWidth)
      .attr("height", svgHeight);

    // Append a SVG group
    var chartGroup = svg.append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Initial Params
    var chosenXAxis = "poverty";
    var chosenYAxis = "healthcare";

    // function used for updating x-scale var upon click on axis label
    function xScale(censusData, chosenXAxis) {
        // create scales
        var xLinearScale = d3.scaleLinear()
            .domain([d3.min(censusData, d=> d[chosenXAxis]) * 0.8,
              d3.max(censusData, d => d[chosenXAxis]) * 1.2
            ])
            .range([0, width]);
        
        return xLinearScale;
    }


    // Repeat process for y-scale
    function yScale(censusData, chosenYAxis) {
        // create scales
        var yLinearScale = d3.scaleLinear()
            .domain([d3.min(censusData, d => d[chosenYAxis]) * 0.8,
              d3.max(censusData, d => d[chosenYAxis]) * 1.2
            ])
            .range([height, 0]);
    
        return yLinearScale;
    }

    // function used for updating xAxis var upon click on axis label
    function renderXAxes(newXScale, xAxis) {
        var bottomAxis = d3.axisBottom(newXScale);

        xAxis.transition()
          .duration(1000)
          .call(bottomAxis);
    
        return xAxis;
    }

    // function used for updating yAxis var upon click on axis label
    function renderYAxes(newYScale, yAxis) {
        var leftAxis = d3.axisLeft(newYScale);

        yAxis.transition()
          .duration(1000)
          .call(leftAxis);

        return yAxis;
    }

    // function used for updating circles group with a transition to
    // new circles
    function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

        circlesGroup.transition()
          .duration(1000)
          .attr("cx", d => newXScale(d[chosenXAxis]))
          .attr("cy", d => newYScale(d[chosenYAxis]));

        return circlesGroup;
    }
    
    // function for updating text group with a transtion to new text
    function renderText(textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

        textGroup.transition()
          .duration(1000)
          .attr("x", d => newXScale(d[chosenXAxis]))
          .attr("y", d => newYScale(d[chosenYAxis]))
          .attr("text-anchor", "middle");

        return textGroup;
    }

    // function used for updating circles group with new tooltip
    function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textGroup) {

        if (chosenXAxis === "poverty") { 
          var xLabel = "Poverty (%):";
        }
        else if (chosenXAxis === "age") {
          var xLabel = "Age (Median):";
        }
        else {
          var xLabel = "Household Income (Median):";
        }
        if (chosenYAxis === "healthcare") {
          var yLabel = "Lacks Healthcare (%):";
        }
        else if (chosenYAxis === "obesity") {
          var yLabel = "Obese (%):";
        }
        else {
          var yLabel = "Smokes (%):";
        }

        var toolTip = d3.tip()
          .attr("class", "d3-tip")
          .offset([80, -60])
          .html(function (d) {
            return (`<strong>${d.abbr}</strong><br>${xLabel} ${d[chosenXAxis]}<br>${yLabel} ${d[chosenYAxis]}`);
          });
    
        // create circles tooltip in the chart
        circlesGroup.call(toolTip);
        // create event listeners to display/hide the circles tooltip
        circlesGroup.on("mouseover", function(data) {
          toolTip.show(data, this);
        })
          // onmouseout event
          .on("mouseout", function(data) {
            toolTip.hide(data);
          });
        // create text tooltip in the chart
        textGroup.call(toolTip);
        // create event listeners to display/hide the text tooltip
        textGroup.on("mouseover", function(data) {
          toolTip.show(data, this);
        })
          // onmouseout event
          .on("mouseout", function(data) {
            toolTip.hide(data);
          });

        return circlesGroup;
    }

    // Retrieve data from the csv file and execute everything below
    d3.csv("assets/data/data.csv").then(function(censusData, err) {
        if (err) throw err;

        // parse data
        censusData.forEach(function(data) {
            data.poverty = +data.poverty;
            data.age = +data.age;
            data.income = +data.income;
            data.healthcare = +data.healthcare;
            data.obesity = +data.obesity;
            data.smokes = +data.smokes;
        });

        // xLinearScale and yLinearScale functions above csv import
        var xLinearScale = xScale(censusData, chosenXAxis);
        var yLinearScale = yScale(censusData, chosenYAxis);

        // Create initial axis functions
        var bottomAxis = d3.axisBottom(xLinearScale);
        var leftAxis = d3.axisLeft(yLinearScale);

        // append x axis
        var xAxis = chartGroup.append("g")
            .classed("x-axis", true)
            .attr("transform", `translate(0, ${height})`)
            .call(bottomAxis);
    
        // append y axis
        var yAxis = chartGroup.append("g")
            .classed("y-axis", true)
            .call(leftAxis);
    
        // append initial circles
        var circlesGroup = chartGroup.selectAll(".stateCircle")
            .data(censusData)
            .enter()
            .append("circle")
            .attr("cx", d => xLinearScale(d[chosenXAxis]))
            .attr("cy", d => yLinearScale(d[chosenYAxis]))
            .attr("class", "stateCircle")
            .attr("r", 15)
            .attr("opacity", ".75");
    
        // append text to circles        
        var textGroup = chartGroup.selectAll(".stateText")
            .data(censusData)
            .enter()
            .append("text")
            .attr("x", d => xLinearScale(d[chosenXAxis]))
            .attr("y", d => yLinearScale(d[chosenYAxis] + 4))
            .text(d => (d.abbr))
            .attr("class", "stateText")
            .attr("text-anchor", "middle")
            .attr("font-size", "12px")
            .style("fill", "white")
            .attr("font-weight", "bold");
    
        // Create group with multiple x-axis labels
        var xLabelsGroup = chartGroup.append("g")
            .attr("transform", `translate(${width / 2}, ${height + 20})`);
        // append x-axis
        var povertyLabel = xLabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 20)
            .attr("value", "poverty") // value to grab for event listener
            .classed("active", true)
            .text("Poverty (%)");
    
        var ageLabel = xLabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 40)
            .attr("value", "age") // value to grab for event listener
            .classed("inactive", true)
            .text("Age (Median)");
    
        var incomeLabel = xLabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 60)
            .attr("value", "income") // value to grab for event listener
            .classed("inactive", true)
            .text("Household Income (Median)");
    
        // Create group with multiple y-axis labels
        var yLabelsGroup = chartGroup.append("g")
            .attr("transform", `translate(-25, ${height / 2})`);
    
        // append y-axis
        var healthcareLabel = yLabelsGroup.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -25)
            .attr("x", 0)
            .attr("value", "healthcare")
            .attr("dy", "lem")
            .classed("axis-text", true)
            .classed("active", true)
            .text("Lacks Healthcare (%)");
        
        var smokesLabel = yLabelsGroup.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -45)
            .attr("x", 0)
            .attr("value", "smokes")
            .attr("dy", "lem")
            .classed("axis-text", true)
            .classed("inactive", true)
            .text("Smokes (%)");
    
        var obesityLabel = yLabelsGroup.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -60)
            .attr("x", 0)
            .attr("value", "obesity")
            .attr("dy", "lem")
            .classed("axis-text", true)
            .classed("inactive", true)
            .text("Obese (%)");
    
        // updateToolTip function above csv import
        var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textGroup);

        // x-axis labels event listener
        xLabelsGroup.selectAll("text")
            .on("click", function () {
                // get value of selection
                var value = d3.select(this).attr("value");
                if (value !== chosenXAxis) {

                    // replaces chosenXAxis with value
                    chosenXAxis = value;

                    // functions here found above csv import
                    // updates x scale for new data
                    xLinearScale = xScale(censusData, chosenXAxis);

                    // updates x axis with transition
                    xAxis = renderXAxes(xLinearScale, xAxis);

                    // updates circles and text with new values
                    circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                    textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                    // updates tooltips with new info
                    circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textGroup);

                    // changes classes to change bold text
                    if (chosenXAxis === "poverty") {
                        povertyLabel
                            .classed("active", true)
                            .classed("inactive", false);
                        ageLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        incomeLabel
                            .classed("active", false)
                            .classed("inactive", true);
                    }
                    else if (chosenXAxis === "age") {
                        povertyLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        ageLabel
                            .classed("active", true)
                            .classed("inactive", false);
                        incomeLabel
                            .classed("active", false)
                            .classed("inactive", true);
                    }
                    else {
                        povertyLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        ageLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        incomeLabel
                            .classed("active", true)
                            .classed("inactive", false);
                    }
                }
            });

        // y-axis labels event listener
        yLabelsGroup.selectAll("text")
            .on("click", function () {
                // get value of selection
                var value = d3.select(this).attr("value");
                if (value !== chosenYAxis) {

                    // replaces chosenXAxis with value
                    chosenYAxis = value;

                    // functions here found above csv import
                    // updates x scale for new data
                    yLinearScale = yScale(censusData, chosenYAxis);

                    // updates y-axis with transition
                    yAxis = renderYAxes(yLinearScale, yAxis);

                    // updates circles and text with new values
                    circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                    textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                    // updates tooltips with new info
                    circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textGroup);

                    // changes classes to change bold text
                    if (chosenYAxis === "healthcare") {
                        healthcareLabel
                            .classed("active", true)
                            .classed("inactive", false);
                        obesityLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        smokesLabel
                            .classed("active", false)
                            .classed("inactive", true);
                    }
                    else if (chosenYAxis === "obesity") {
                        healthcareLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        obesityLabel
                            .classed("active", true)
                            .classed("inactive", false);
                        smokesLabel
                            .classed("active", false)
                            .classed("inactive", true);
                    }
                    else {
                        healthcareLabel
                            .classed("active", false)
                            .classed("inactive", true);
                    obesityLabel
                            .classed("active", false)
                            .classed("inactive", true);
                    smokesLabel
                            .classed("active", true)
                            .classed("inactive", false);
                    }
                }
            });
    }).catch(function(error) {
    console.log(error)
    });
}
// On loading browser, makeResponsive() is called
makeResponsive();

// When the browser window is resized, makeResponsive() is called
d3.select(window).on("resize", makeResponsive);