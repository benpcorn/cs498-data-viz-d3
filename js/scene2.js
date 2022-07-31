function chart_1(){
  // set the dimensions and margins of the graph
  var margin = {top: 100, right: 100, bottom: 90, left: 300},
      width = 600 - margin.left - margin.right,
      height = 800 - margin.top - margin.bottom;

  const annotations = [
    {
      note: {
        label: "Government spending on energy projects ",
        title: "Energy Spending",
        wrap: 200,  // try something smaller to see text split in several lines
        padding: 10   // More = text lower
        
      },
      color: ["#cc0000"],
      x: 0,
      y: 600,
      dy: -20,
      dx: 50
    }
  ]

  var makeAnnotations = d3.annotation()
  .annotations(annotations)

  // append the svg object to the body of the page
  var svg_1 = d3.select("#chart_1")
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

  var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  // Parse the Data
  d3.csv("../data/federal_spending_categories.csv", function(data) {

    var data = data.filter((d)=>{return d.child !== '' && d.function === 'category' && d.federal_spending > 0;})
    var data = d3.nest()
      .key(function(d) { return d.parent;})
      .rollup(function(d) { 
      return d3.sum(d, function(g) {return g.federal_spending; });
      }).entries(data);

    data.sort(function(a, b) {
      return d3.descending(a.value, b.value)
    })

    // Add X axis
    var x = d3.scaleLinear()
      .domain([0, d3.max(data).value])
      .range([ 0, width]);
    svg_1.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x).tickFormat(function(d){
        return ("$" + d3.format(".2s")(d)).replace("G", "B");
    }))
      .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");


    // Y axis
    var y = d3.scaleBand()
      .range([ 0, height ])
      .domain(data.map(function(d) { return (d.key); }))
      .padding(.1);
    svg_1.append("g")
      .call(d3.axisLeft(y))

    //Bars
    svg_1.selectAll("chart_1")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", x(0) )
      .attr("y", function(d) { return y(d.key); })
      .attr("width", function(d) { return x(d.value); })
      .attr("height", y.bandwidth() )
      .attr("fill", "#69b3a2")
      .on('mouseover', function (d, i) {
        d3.select(this).transition()
            .duration('50')
            .attr('opacity', '.85');
        div.transition()
            .duration(50)
            .style("opacity", 1);
        sum = d3.sum(data, function(d) {
          return d.value;
        });
        let num = ((d.value / sum)*100).toPrecision(2).toString() + '%';
        div.html(num)
            .style("left", (d3.event.pageX + 10) + "px")
            .style("top", (d3.event.pageY - 15) + "px");
      })
      .on('mouseout', function (d, i) {
        d3.select(this).transition()
          .duration('120')
          .attr('opacity', '1');
        div.transition()
          .duration('120')
          .style("opacity", 0);
      })
      .on('click', function(d) {
        console.log(d)
        d3.selectAll('#chart_2 > svg').remove();
        chart_2(d.key)
      })
      .call(makeAnnotations)


    chart_2(data[0].key)
  })
  
  svg_1.append("g")
  .call(makeAnnotations)
}

function chart_2(key){
  // set the dimensions and margins of the graph
  var margin = {top: 100, right: 80, bottom: 90, left: 250},
      width = 600 - margin.left - margin.right,
      height = 450 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  var svg_1 = d3.select("#chart_2")
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

  var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  // Parse the Data
  d3.csv("../data/federal_spending_categories.csv", function(data) {
    
    var data = data.filter(function (a) { return a.parent === key; });
    var data = data.filter((d)=>{return d.child !== '' && d.function === 'category' && d.federal_spending > 0;})
    var data = d3.nest()
      .key(function (d) { return d.child; })
      .rollup(function(d) { 
        return d3.sum(d, function(g) {return g.federal_spending; });
      }).entries(data);

    data.sort(function(a, b) {
      return d3.descending(a.value, b.value)
    })

    var x = d3.scaleLinear()
      .domain([0, d3.max(data).value])
      .range([ 0, width]);
    svg_1.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x).tickFormat(function(d){
        return ("$" + d3.format(".2s")(d)).replace("G", "B");
    }))
      .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

    var y = d3.scaleBand()
      .range([ 0, height ])
      .domain(data.map(function(d) { return (d.key); }))
      .padding(.1);
    svg_1.append("g")
      .call(d3.axisLeft(y))

    svg_1.selectAll("chart_2")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", x(0) )
      .attr("y", function(d) { return y(d.key); })
      .attr("width", function(d) { return x(d.value); })
      .attr("height", y.bandwidth() )
      .attr("fill", "#69b3a2")
      .on('mouseover', function (d, i) {
        d3.select(this).transition()
            .duration('50')
            .attr('opacity', '.85');
        div.transition()
            .duration(50)
            .style("opacity", 1);
        sum = d3.sum(data, function(d) {
          return d.value;
        });
        let num = ((d.value / sum)*100).toPrecision(2).toString() + '%';
        div.html(num)
            .style("left", (d3.event.pageX + 10) + "px")
            .style("top", (d3.event.pageY - 15) + "px");
      })
      .on('mouseout', function (d, i) {
        d3.select(this).transition()
          .duration('120')
          .attr('opacity', '1');
        div.transition()
          .duration('120')
          .style("opacity", 0);
      })
  })
}

chart_1()