"use strict";
(function(){
    let data = ""
    let generation = 1;
    let legendary = "All";
    let svgContainer = ""

    // dimensions for svg
    const measurements = {
        width: 1800,
        height: 800,
        marginLeft: 150,
        marginTop: 50,
        marginBottom:150,
        marginRight: 450
    }

    // colors for pokemon types
    const colors = {
        "Bug": "#4e79a7",
        "Dark": "#A0CBE8",
        "Dragon": '#f28e2b',
        "Electric": "#ffbe7d",
        "Fairy": "#b07aa1&D",
        "Fighting": "#59a14f",
        "Fire": "#8cd17d",
        "Flying": "#cbc3ff",
        "Ghost": "#b6992d",
        "Grass": "#f1ce63",
        "Ground": "#499894",
        "Ice": "#86bcb6",
        "Normal": "#e15759",
        "Poison": "#ff9d9a",
        "Psychic": "#79706e",
        "Rock": "79706e",
        "Steel": "#BAB0AC",
        "Water": "#fabfd2"
      }

    // make tooltip
    let div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

    // load data and append svg to body
    svgContainer = d3.select('body').append("svg")
        .attr('width', measurements.width)
        .attr('height', measurements.height);
    d3.csv("pokemon.csv")
        .then((csvData) => data = csvData)
        .then(() => makeScatterPlot())
        
    // Create sidebar for colors & types
    function sidebar(circles) {
        var size = 20
        var sideColors = svgContainer.selectAll("sidecolors")
            .data(d3.map(data, function (d) { return d["Type 1"] }).keys())
            .enter()
            .append("rect")
            .attr("transform", "translate(675,130)")
            .attr("x", 770)
            .attr("y", function (d, i) { return 50 + i * (size + 7) })
            .attr("width", size)
            .attr("height", size)
            .style("fill", function (d) { return colors[d] })

        var sideText = svgContainer.selectAll("sidetext")
            .data(d3.map(data, function (d) { return d["Type 1"] }).keys())
            .enter()
            .append("text")
            .attr("text-anchor", "left")
            .attr("transform", "translate(675,130)")
            .attr("x", 770 + size * 1.4)
            .attr("y", function (d, i) { return 50 + i * (size + 7) + (size / 2) })
            .style("fill", function (d) { return colors[d] })
            .text(function (d) { return d })
            .style("alignment-baseline", "middle")

            sideText.on("click", function () {
                var selected = this.innerHTML;
                var display = this.checked ? "inline" : "none";
                var displayOthers = this.checked ? "none" : "inline";
                console.log(circles)
                
                circles
                    .filter(function(d) {return selected == +d["Type 1"];})
                    .attr("display", display);
                circles 
                    .filter(function(d) {return selected != +d["Type 1"];})
                    .attr("display", displayOthers);
            })
            
    }

    function makeScatterPlot() {
        // get arrays of Sp. Def and Total 
        let spDef = data.map((row) => parseInt(row["Sp. Def"]))
        let total = data.map((row) =>  parseFloat(row["Total"]))

        // find range of data
        const limits = findMinMax(spDef, total)

        // create a function to scale x coordinates
        let scaleX = d3.scaleLinear()
            .domain([limits.spDefMin - 5, limits.spDefMax])
            .range([0 + measurements.marginLeft, measurements.width - measurements.marginRight])
        // create a function to scale y coordinates
        let scaleY = d3.scaleLinear()
            .domain([limits.totalMax, limits.totalMin - 0.05])
            .range([0 + measurements.marginTop, measurements.height - measurements.marginBottom])
        
        // x-axis name
        svgContainer.append('text')
            .attr('x', 712.5)
            .attr('y', 725)
            .style('font-size', '15pt')
            .text('Special Defense');
      
        // y-axis name
        svgContainer.append('text')
            .attr('transform', 'translate(90, 425)rotate(-90)')
            .style('font-size', '15pt')
            .text('Total Stats');

        drawAxes(scaleX, scaleY)

        plotData(scaleX, scaleY)

        
    }

    function findMinMax(spDef, total) {
        return {
            spDefMin: d3.min(spDef),
            spDefMax: d3.max(spDef),
            totalMin: d3.min(total),
            totalMax: d3.max(total)
        }
    }

    function drawAxes(scaleX, scaleY) {
        let xAxis = d3.axisBottom()
            .scale(scaleX)

        let yAxis = d3.axisLeft()
            .scale(scaleY)
        
        // append x and y axes to svg
        svgContainer.append('g')
            .attr('transform', 'translate(0,650)')
            .call(xAxis)

        svgContainer.append('g')
            .attr('transform', 'translate(150, 0)')
            .call(yAxis)
    }

    function plotData(scaleX, scaleY) {
        const xMap = function(d) { return scaleX(+d["Sp. Def"]) }
        const yMap = function(d) { return scaleY(+d["Total"]) }   
        
        const circles = svgContainer.selectAll(".circle")
            .data(data)
            .enter()
            .append('circle')
                .attr('cx', xMap)
                .attr('cy', yMap)
                .attr('r', 6)
                .attr('fill', function (d) { return colors[d["Type 1"]] })
            // add tooltip functionality to points
            .on("mouseover", function(d) {		
                div.transition()		
                    .duration(200)		
                    .style("opacity", .9);		
                div	.html( d["Name"] + "<br/>" + 
                           d["Type 1"] + "<br/>" + 
                           d["Type 2"])
                    .style("height", 70 + 'px')
                    .style("width", 150 + 'px')
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
                })
            .on("mouseout", function(d) {		
                div.transition()		
                    .duration(500)		
                    .style("opacity", 0);	
            });

        // Generation Dropdown
        svgContainer.append('text')
            .attr('transform', 'translate(1440, 125)')
            .style('font-size', '12pt')
            .style('font-weight', 'bold')
            .text('Generation (group)');
        var dropDown = d3.select("body").append("select")
            .attr("name", "Generation")
            .attr("class", "generation")
        var genOptions = dropDown.selectAll("option.state")
            .data(d3.map(data, function(d) { return d.Generation}).keys())
            .enter()
            .append("option")
            .text(function (d) { return d; })
            .attr("value", function (d) { return d;});
        var genDefault = dropDown.append("option")
            .data(data)
            .text("All")
            .attr("value", "All")
            .enter();
    
        dropDown.on("change", function() {
            var selected = this.value;
            generation = selected;
            var displayOthers = this.checked ? "inline" : "none";
            var display = this.checked ? "none" : "inline";

            circles
                .filter(function(d) {return generation == d.Generation;})
                .attr("display", display);
            circles 
                .filter(function(d) {return generation != d.Generation;})
                .attr("display", displayOthers);
            

            if (generation == "All" && legendary == "All") {
                circles.attr("display", display);
            } else if (generation == "All" && legendary != "All"){
                circles.filter(function (d) { return legendary != d.Legendary; })
                    .attr("display", displayOthers);

                circles.filter(function (d) { return legendary == d.Legendary; })
                    .attr("display", display);
            } else if (generation != "All" && legendary == "All") {
                circles
                    .filter(function (d) { return generation != d.Generation; })
                    .attr("display", displayOthers);

                circles
                    .filter(function (d) { return generation == d.Generation; })
                    .attr("display", display);
            } else if (generation != "All" && legendary != "All") {
                circles
                    .filter(function (d) { return generation != d.Generation || legendary != d.Legendary; })
                    .attr("display", displayOthers);

                    circles
                    .filter(function (d) { return generation == d.Generation && legendary == d.Legendary; })
                    .attr("display", display);
            }
        });

        // Legendary radio buttons
        var legendaryData = ["All", "True", "False"], 
        legendaryDefault = 0;  
        var form = d3.select("body").append("form").attr("class", "legendary");
        svgContainer.append('text')
            .attr('transform', 'translate(1440, 20)')
            .style('font-size', '12pt')
            .style('font-weight', 'bold')
            .text('Legendary');
        
        var labels = form.selectAll("label")
            .data(legendaryData)
            .enter()
            .append("label")
            .text(function(d) {return d;})
            .insert("input")
            .attr("type", "radio")
            .attr("class", "shape")
            .attr("name", "mode")
            .attr("value", function(d) {return d;})
            .property("checked", function(d, i) {return i === legendaryDefault;});

        labels.on("change", function () {
            var selected = this.value;
            legendary = selected;
            var display = this.checked ? "inline" : "none";
            var displayOthers = this.checked ? "none" : "inline";

            if (legendary == 'All' && generation == "All") {
                circles.attr("display", display)
            } else if (legendary == "All" && generation != "All") {
                circles
                    .filter(function (d) { return generation != d.Generation; })
                    .attr("display", displayOthers);

                circles
                    .filter(function (d) { return generation == d.Generation; })
                    .attr("display", display);
            } else if (legendary != "All" && generation == "All"){
                circles.filter(function (d) { return legendary != d.Legendary; })
                    .attr("display", displayOthers);

                circles.filter(function (d) { return legendary == d.Legendary; })
                    .attr("display", display);
            } else if (legendary != "All" && generation != "All") {
                circles
                    .filter(function (d) { return generation != d.Generation || legendary != d.Legendary; })
                    .attr("display", displayOthers);

                circles
                    .filter(function (d) { return generation == d.Generation && legendary == d.Legendary; })
                    .attr("display", display);
            }
        })

        sidebar(circles)
    }

})()