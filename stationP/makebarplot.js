function chart(summaryData) {

    const onelayer = summaryData.filter(d => d.Depth === "0-10 dbar");

    const scaleAnomaly = d3
        .scaleDiverging(t => d3.interpolateRdBu(1 - t))
        .domain([d3.min(onelayer, d => d.temp), d3.mean(onelayer, d => d.temp), d3.max(onelayer, d => d.temp)]);

    const margin = {
        top: 20,
        right: 20,
        bottom: 30,
        left: 40
    };

    // const width = 960,
    // height = 300

    // const svg = d3.select("svg");
    const svg = d3.select(".bars")
    .append("svg")
    .attr("width", 960)
    .attr("height", 300);

  d3.select('body')
    .append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0);

    const width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const bars = g.selectAll(".bars")
        .data(onelayer);

        bars.enter().append("rect")
        .attr("class", "bars")
        .attr("y", 0)
        .attr("height", height)
        .attr("x", function (d, i) {
            return i * ((width) / onelayer.length);
        })
        .attr("width", width / onelayer.length)
        .style("fill", function (d) {
            return scaleAnomaly(d.temp);
        })
        .on('mouseover', (d,i) => {
            // console.log(d)
            d3.select('.tooltip')
            
            .style('top', () => {
                let y = d3.event.y
                return y - 60 + 'px'
            })
            .style('left',d3.event.x + 20 + 'px')
            .html(` 
            <span><b>${d.Year} :</b></span> <span>${Math.round(d.temp * 100) / 100}</span>  <span> °C </span><br>
            
            `)
            // .transition()
            // .duration(100)
            .style('opacity',1)
        })
        .on('mouseout', (d,i) => {
            d3.select('.tooltip')
            .style('opacity', 0)
            
        })

    const x = d3
        .scaleBand()
        .domain(summaryData.map(d => d.Year))
        // .nice()
        .range([0, width]);

    const xAxis = g =>
        g
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom().scale(x) .tickValues(x.domain().filter((d, i) => !(i % 10))))
        //.tickFormat(d3.format(".0f")))
      .call(g => g.select(".domain").remove());

    g.append("g").call(xAxis);

}