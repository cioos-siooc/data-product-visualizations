function makescatter(p26_long) {
    const data = p26_long
        .map(d => {
            return {
                date: d.Year,
                value: d.temp
            };
        });
        // console.log(data,p26_long)
    const margin = { top: 20, right: 30, bottom: 30, left: 40 }    
    const height = 400;
    const width = 960;

    const svg = d3.select(".scatter1")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

        const x = d3
        .scaleTime()
        .domain(d3.extent(data, d => d.date))
        .nice()
        .range([margin.left, width - margin.right]);
    
      const xAxis = g =>
        g
          .attr("transform", `translate(0,${height - margin.bottom})`)
          .call(d3.axisBottom(x).tickFormat(d3.format(".0f")))
          .call(g => g.select(".domain").remove());
    
      const max = d3.max(data, d => Math.abs(d.value));
      const min = d3.min(data, d => Math.abs(d.value));
    
      const mean = d3.mean(data, d => Math.abs(d.value));
    
      // console.log(max);
      // const z = d3.scaleSequential(d3.interpolateRdBu).domain([max, -max]);
    
      const z = d3
        .scaleDiverging(t => d3.interpolateRdBu(1 - t))
        .domain([min, mean, max]);
      // }
    
      svg.append("g").call(xAxis);
    
      const yAxis = g =>
        g
          .attr("transform", `translate(${margin.left},0)`)
          .call(d3.axisLeft(y).ticks(null))
          .call(g => g.select(".domain").remove())
          .call(g =>
            g
              .append("text")
              .attr("fill", "#000")
              .attr("x", 5)
              .attr("y", margin.top)
              .attr("dy", "0.32em")
              .attr("text-anchor", "start")
              .attr("font-weight", "bold")
              .text("Temperature (°C) - 0-10 dbar")
          );
    
      const y = d3
        .scaleLinear()
        .domain(d3.extent(data, d => d.value))
        .nice()
        .range([height - margin.bottom, margin.top]);
    
      svg.append("g").call(yAxis);
    
      const regressionLine = ss.linearRegressionLine(
        ss.linearRegression(data.map(row => [+row.date, row.value]))
      );
    
      const regressionEndpoints = [
        { date: data[0].date, value: regressionLine(+data[0].date) },
        {
          date: data[data.length - 1].date,
          value: regressionLine(+data[data.length - 1].date)
        }
      ];
    
      svg
        .append("path")
        .datum(regressionEndpoints)
        .attr("fill", "none")
        .attr("stroke", "deeppink")
        .attr("stroke-width", 1.5)
        .attr("stroke-linejoin", "round")
        .attr("stroke-dasharray", "10 10")
        .attr("stroke-linecap", "round")
        .attr(
          "d",
          d3
            .line()
            .x(d => x(d.date))
            .y(d => y(d.value))
        );
    
      svg
        .append("path")
        .datum(regressionEndpoints)
        .attr("fill", "none")
        .attr("stroke", "#ccc")
        // .attr("stroke-width", 1)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr(
          "d",
          d3
            .line()
            .x(d => x(d.date))
            .y(d => y(mean))
        );

      
    
      svg
        .append("g")
        .attr("stroke", "#000")
        .attr("stroke-opacity", 0.2)
        .selectAll("circle")
        .data(data)
        .join("circle")
        .attr("cx", d => x(d.date))
        .attr("cy", d => y(d.value))
        .attr("fill", d => z(d.value))
        .attr("r", 3.5).on('mouseover', (d,i) => {
          console.log(d)
          d3.select('.tooltip')
          
          .style('top', () => {
              let y = d3.event.y
              return y - 20 + 'px'
          })
          .style('left',d3.event.x + 20 + 'px')
          .html(` 
          <span><b>${d.date} :</b></span> <span>${Math.round(d.value * 100) / 100}</span>  <span> °C </span><br>
          
          `)
          // .transition()
          // .duration(100)
          .style('opacity',1)
      })
      .on('mouseout', (d,i) => {
          d3.select('.tooltip')
          .style('opacity', 0)
          
      });

}