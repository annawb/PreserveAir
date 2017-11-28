var colorArray = {"temp": "rgb(230,0,0)", "humid": "rgb(42, 141, 185)"};
var innerColorArray = {"temp": "rgb(230, 200, 200)", "humid": "rgb(194, 228, 244)"};
var tubeColorArray = {"temp": "#999999", "humid": "#999999"};
var minArray = {"temp": 5, "humid": 20};
var maxArray = {"temp": 50, "humid": 110};

function createGauge(sizer, gaugeType, id, currentTemp) {
    document.getElementById(id).innerHTML= "";
    
    var width = 80 * sizer,
        height = 180 * sizer,
        maxTemp = maxArray[gaugeType],
        minTemp = minArray[gaugeType];

    var bottomY = height - 5,
        topY = 5,
        bulbRadius = 20 * sizer,
        tubeWidth = 21.5 * sizer,
        tubeBorderWidth = 1 * sizer,
        mercuryColor = colorArray[gaugeType],
        innerBulbColor = innerColorArray[gaugeType],
        tubeBorderColor = tubeColorArray[gaugeType];

    var bulb_cy = bottomY - bulbRadius,
        bulb_cx = width/2,
        top_cy = topY + tubeWidth/2;


    var svg = d3.select("#"+id)
      .append("svg")
      .attr("width", width)
      .attr("height", height);


    var defs = svg.append("defs");

    // Define the radial gradient for the bulb fill colour
    var bulbGradient = defs.append("radialGradient")
      .attr("id", "bulbGradient"+id)
      .attr("cx", "50%")
      .attr("cy", "50%")
      .attr("r", "50%")
      .attr("fx", "50%")
      .attr("fy", "50%");

    bulbGradient.append("stop")
      .attr("offset", "0%")
      .style("stop-color", innerBulbColor);

    bulbGradient.append("stop")
      .attr("offset", "90%")
      .style("stop-color", mercuryColor);




    // Circle element for rounded tube top
    svg.append("circle")
      .attr("r", tubeWidth/2)
      .attr("cx", width/2)
      .attr("cy", top_cy)
      .style("fill", "#FFFFFF")
      .style("stroke", tubeBorderColor)
      .style("stroke-width", tubeBorderWidth + "px");


    // Rect element for tube
    svg.append("rect")
      .attr("x", width/2 - tubeWidth/2)
      .attr("y", top_cy)
      .attr("height", bulb_cy - top_cy)
      .attr("width", tubeWidth)
      .style("shape-rendering", "crispEdges")
      .style("fill", "#FFFFFF")
      .style("stroke", tubeBorderColor)
      .style("stroke-width", tubeBorderWidth + "px");


    // White fill for rounded tube top circle element
    // to hide the border at the top of the tube rect element
    svg.append("circle")
      .attr("r", tubeWidth/2 - tubeBorderWidth/2)
      .attr("cx", width/2)
      .attr("cy", top_cy)
      .style("fill", "#FFFFFF")
      .style("stroke", "none");



    // Main bulb of thermometer (empty), white fill
    svg.append("circle")
      .attr("r", bulbRadius)
      .attr("cx", bulb_cx)
      .attr("cy", bulb_cy)
      .style("fill", "#FFFFFF")
      .style("stroke", tubeBorderColor)
      .style("stroke-width", tubeBorderWidth + "px");
    

    // Rect element for tube fill colour
    svg.append("rect")
      .attr("x", width/2 - (tubeWidth - tubeBorderWidth)/2)
      .attr("y", top_cy)
      .attr("height", bulb_cy - top_cy)
      .attr("width", tubeWidth - tubeBorderWidth)
      .style("shape-rendering", "crispEdges")
      .style("fill", "#FFFFFF")
      .style("stroke", "none");


    // Scale step size
    var step = (maxTemp-minTemp)/9;

    // Determine a suitable range of the temperature scale
    var domain = [
      step * Math.floor(minTemp / step),
      step * Math.ceil(maxTemp / step)
      ];

    if (minTemp - domain[0] < 0.66 * step) {
      domain[0] -= step;
    }

    if (domain[1] - maxTemp < 0.66 * step) {
      domain[1] += step;
    }


    // D3 scale object
    var scale = d3.scale.linear()
      .range([bulb_cy - bulbRadius/2 - 8.5, top_cy])
      .domain(domain);

    var tubeFill_bottom = bulb_cy,
        tubeFill_top = scale(currentTemp);

    // Rect element for the red mercury column
    svg.append("rect")
      .attr("x", width/2 - (tubeWidth - 10)/2)
      .attr("y", tubeFill_top)
      .attr("width", tubeWidth - 10)
      .attr("height", tubeFill_bottom - tubeFill_top)
      .style("shape-rendering", "crispEdges")
      .style("fill", mercuryColor);


    // Main thermometer bulb fill
    svg.append("circle")
      .attr("r", bulbRadius - 6)
      .attr("cx", bulb_cx)
      .attr("cy", bulb_cy)
      .style("fill", "url(#bulbGradient"+id+")")
      .style("stroke", mercuryColor)
      .style("stroke-width", "2px");

    // Print values under bulb
    svg.append("text")
        .html(Math.round(currentTemp*10.0)/10.0)
        .attr("x", width/2 - (10 * sizer))
        .attr("y", height - (19 * sizer))
        .style("color", "#777777")
        .style("text-align", "center")
        .style("font-size", 12 * sizer + "px");

    // Values to use along the scale ticks up the thermometer
    var tickValues = d3.range((domain[1] - domain[0])/step + 1).map(function(v) { return domain[0] + v * step; });


    // D3 axis object for the temperature scale
    var axis = d3.svg.axis()
      .scale(scale)
      .innerTickSize(7)
      .outerTickSize(0)
      .tickValues(tickValues)
      .orient("left");

    // Add the axis to the image
    var svgAxis = svg.append("g")
      .attr("id", "tempScale")
      .attr("transform", "translate(" + (width/2 - tubeWidth/2) + ",0)")
      .call(axis);

    // Format text labels
    svgAxis.selectAll(".tick text")
        .style("fill", "#777777")
        .style("font-size", 10 * sizer + "px");

    // Set main axis line to no stroke or fill
    svgAxis.select("path")
      .style("stroke", "none")
      .style("fill", "none");

    // Set the style of the ticks 
    svgAxis.selectAll(".tick line")
      .style("stroke", tubeBorderColor)
      .style("shape-rendering", "crispEdges")
      .style("stroke-width", "1px");
}

//     Graph via http://nvd3.org/examples/line.html and https://bost.ocks.org/mike/path/
//    nv.addGraph(function() {
//  var chart = nv.models.lineChart()
//                .margin({left: 100})  //Adjust chart margins to give the x-axis some breathing room.
//                .useInteractiveGuideline(true)  //We want nice looking tooltips and a guideline!
//                .transitionDuration(350)  //how fast do you want the lines to transition?
//                .showLegend(true)       //Show the legend, allowing users to turn on/off line series.
//                .showYAxis(true)        //Show the y-axis
//                .showXAxis(true)        //Show the x-axis
//  ;
//
//  chart.xAxis     //Chart x-axis settings
//      .axisLabel('Time (ms)')
//      .tickFormat(d3.format(',r'));
//
//  chart.yAxis     //Chart y-axis settings
//      .axisLabel('Voltage (v)')
//      .tickFormat(d3.format('.02f'));
//
//  /* Done setting the chart up? Time to render it!*/
//  var myData = sinAndCos();   //You need data...
//
//  d3.select('#chart svg')    //Select the <svg> element you want to render the chart in.   
//      .datum(myData)         //Populate the <svg> element with chart data...
//      .call(chart);          //Finally, render the chart!
//
//  //Update the chart when window resizes.
//  nv.utils.windowResize(function() { chart.update() });
//  return chart;
//});
///**************************************
// * Simple test data generator
// */
//function sinAndCos() {
//  var sin = [],sin2 = [],
//      cos = [];
//
//  //Data is represented as an array of {x,y} pairs.
//  for (var i = 0; i < 100; i++) {
//    sin.push({x: i, y: Math.sin(i/10)});
//    sin2.push({x: i, y: Math.sin(i/10) *0.25 + 0.5});
//    cos.push({x: i, y: .5 * Math.cos(i/10)});
//  }
//
//  //Line chart data should be sent as an array of series objects.
//  return [
//    {
//      values: sin,      //values - represents the array of {x,y} data points
//      key: 'Sine Wave', //key  - the name of the series.
//      color: '#ff7f0e'  //color - optional: choose your own line color.
//    },
//    {
//      values: cos,
//      key: 'Cosine Wave',
//      color: '#2ca02c'
//    },
//    {
//      values: sin2,
//      key: 'Another sine wave',
//      color: '#7777ff',
//      area: true      //area - set to true if you want this line to turn into a filled area chart.
//    }
//  ];
//}


var pauseDuration = 100 // in milliseconds

// Make back sensors:
function updateAll() {
    
    $.ajax({
        type:"GET",
        dataType: "json",
        url: "http://127.0.0.1:5000/sensor-data",
        success: function(data){            
            createGauge(0.7, "temp", "thermo1", data['t1']);
            createGauge(0.7, "humid", "humid1", data['h1']);

            createGauge(0.8, "temp", "thermo2", data['t2']);
            createGauge(0.8, "humid", "humid2", data['h2']);

            createGauge(1.1, "temp", "thermo3", data['t3']);
            createGauge(1.1, "humid", "humid3", data['h3']);

            window.setTimeout(updateAll, pauseDuration);
            
        }
    });
    

}

this.updateAll();