Array.prototype.groupBy = function (props) {
  var arr = this;
  var partialResult = {};

  arr.forEach(el=>{

      var grpObj = {};

      props.forEach(prop=>{
            grpObj[prop] = el[prop]
      });

      var key = JSON.stringify(grpObj);

      if(!partialResult[key]) partialResult[key] = [];

      partialResult[key].push(el);

  });

  var finalResult = Object.keys(partialResult).map(key=>{
     var keyObj = JSON.parse(key);
     keyObj.values = partialResult[key];
     return keyObj;
  })

  return finalResult;
}

function chart_1(){
  var margin = {top: 0, right: 30, bottom: 30, left: 200},
  width = 800 - margin.left - margin.right,
  height = 600 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  var svg_1 = d3.select("#chart_1")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .style("-webkit-tap-highlight-color", "transparent")
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

  var svg_legend = d3.select("#chart_1")
  .append("svg")
    .attr("width", 500)
    .attr("height", 600)
  .append("g")
    .attr("transform",
          "translate(" + 0 + "," + 0 + ")");

  var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  // Parse the Data
  d3.csv("../data/federal_spending_trends.csv", function(data) {
    
    var data = data.filter((d)=>{return d.child !== '' && d.function === 'category' && d.federal_spending > 0;})
    var data = data.groupBy(['fiscal_year', 'parent'])

    for (let i = 0; i < data.length; i++) {
      spending_sum = 0;
      for (let j = 0; j < data[i].values.length; j++) {
        spending_sum += parseFloat(data[i].values[j].federal_spending)
      }
      delete data[i].values
      data[i]["federal_spending"] = spending_sum
    }

    data.forEach(function (d) {
        d.fiscal_year = (d.fiscal_year);
    });

    // Add X axis --> it is a date format
    var xScale = d3.scaleLinear()
      .domain(d3.extent(data, function(d) { return d.fiscal_year; }))
      .range([ 0, width ]);
    svg_1.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(
        d3.axisBottom(xScale).ticks(5)
        .tickFormat(function(d, i){
          return d.toString()
        })
      );

    // Add Y axis
    var yScale = d3.scaleLinear()
      .domain([0, d3.max(data, function(d) { return +d.federal_spending; })])
      .range([ height, 0 ]);
    svg_1.append("g")
      .call(d3.axisLeft(yScale));

    var sumstat = d3.nest() 
      .key(d => d.parent)
      .entries(data);
  
    console.log(sumstat)

  //set color pallete for different vairables
  var parentName = sumstat.map(d => d.key) 
  var color = d3.scaleOrdinal()
  .domain(parentName)
  .range(["#4e79a7","#f28e2c","#e15759","#76b7b2","#59a14f","#edc949","#af7aa1","#ff9da7","#9c755f","#bab0ab"])

  svg_1.selectAll(".line")
      .data(sumstat)
      .enter()
      .append("path")
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", function(d){ return color(d.key) })
        .attr("stroke-width", 1.5)
        .attr("d", function(d){
          return d3.line()
            .x(function(d) { return xScale(d.fiscal_year); })
            .y(function(d) { return yScale(+d.federal_spending); })
            (d.values)
        })
        .attr('id', function(d) { return d.key })

  // Add one dot in the legend for each name.
  svg_legend.selectAll("mydots")
    .data(parentName)
    .enter()
    .append("circle")
      .attr("cx", 100)
      .attr("cy", function(d,i){ return 100 + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
      .attr("r", 7)
      .style("fill", function(d){ return color(d)})

  // Add one dot in the legend for each name.
  svg_legend.selectAll("mylabels")
    .data(parentName)
    .enter()
    .append("text")
      .attr("x", 120)
      .attr("y", function(d,i){ return 100 + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
      .style("fill", function(d){ return color(d)})
      .text(function(d){ return d})
      .attr("text-anchor", "left")
      .style("alignment-baseline", "middle")

      var mouseG = svg_1.append("g")
      .attr("class", "mouse-over-effects");

    mouseG.append("path") // this is the black vertical line to follow mouse
      .attr("class", "mouse-line")
      .style("stroke", "black")
      .style("stroke-width", "1px")
      .style("opacity", "0");
      
    var lines = document.getElementsByClassName('line');

    var mousePerLine = mouseG.selectAll('.mouse-per-line')
      .data(sumstat)
      .enter()
      .append("g")
      .attr("class", "mouse-per-line");

    mousePerLine.append("circle")
      .attr("r", 4)
      .style("stroke", function(d) {
        return color(d.key);
      })
      .style("fill", "none")
      .style("stroke-width", "1px")
      .style("opacity", "0");

    mousePerLine.append("text")
      .attr("transform", "translate(10,3)");

    mouseG.append('svg:rect') // append a rect to catch mouse movements on canvas
      .attr('width', width) // can't catch mouse events on a g element
      .attr('height', height)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .on('mouseout', function() { // on mouse out hide line, circles and text
        d3.select(".mouse-line")
          .style("opacity", "0");
        d3.selectAll(".mouse-per-line circle")
          .style("opacity", "0");
        d3.selectAll(".mouse-per-line text")
          .style("opacity", "0");
      })
      .on('mouseover', function() { // on mouse in show line, circles and text
        d3.select(".mouse-line")
          .style("opacity", "1");
        d3.selectAll(".mouse-per-line circle")
          .style("opacity", "1");
        d3.selectAll(".mouse-per-line text")
          .style("opacity", "1");
      })
      .on('mousemove', function() { // mouse moving over canvas
        var mouse = d3.mouse(this);
        d3.select(".mouse-line")
          .attr("d", function() {
            var d = "M" + mouse[0] + "," + height;
            d += " " + mouse[0] + "," + 0;
            return d;
          });

        d3.selectAll(".mouse-per-line")
          .attr("transform", function(d, i) {
            var xDate = xScale.invert(mouse[0]),
                bisect = d3.bisector(function(d) { return d.date; }).right;
                idx = bisect(d.values, xDate);
            
            var beginning = 0,
                end = lines[i].getTotalLength(),
                target = null;

            while (true){
              target = Math.floor((beginning + end) / 2);
              pos = lines[i].getPointAtLength(target);
              if ((target === end || target === beginning) && pos.x !== mouse[0]) {
                  break;
              }
              if (pos.x > mouse[0])      end = target;
              else if (pos.x < mouse[0]) beginning = target;
              else break; //position found
            }
            
            d3.select(this).select('text')
              .text(d.key);
              
            return "translate(" + mouse[0] + "," + pos.y +")";
          });
      });
})
}

chart_1()