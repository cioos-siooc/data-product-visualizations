function makeContour(dataset,showContours) {

    const width = 960,
    height = 500;

    const margin = ({
        top: 10,
        right: 50,
        bottom: 30,
        left: 40
    });
    

    const W = width - 2 * margin.right - 2 * margin.left;

    const years = d3.map(dataset, d => d.year).keys();
    
    const depths = [...new Set(dataset.map(d => d.depth))];
    
    const period = d3.extent(dataset, d => parseInt(d.year))

    const x = d3
        .scaleLinear()
        .domain(period)
        .range([2 * margin.left, 2 * margin.left + W])


    
    const svg = d3.select(".contour-chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    

    const w = W / (years.length + 1);

    // data

    const geoPath = d3.geoPath(d3.geoIdentity().reflectY(false));


    const zonalRange = d3.extent(dataset.map(d => d.t_d));

    const color = d3.scaleDiverging([zonalRange[0], 0, zonalRange[1]], t =>
        d3.interpolateRdBu(1 - t)
    );

    const y3 = d3
        .scaleBand()
        .domain(depths)
        .range([height - 3 * margin.bottom - 200, height - 3 * margin.bottom]);

    const g = svg
        .append("g")
        .attr("transform", `translate(${margin.left + 20}, ${0})`)
        .call(d3.axisLeft(y3).ticks());

    svg
        .append("g")
        .attr("transform", `translate(0,${height - 2.5 * margin.bottom})`)
        .call(d3.axisBottom(x).tickFormat(d3.format(".0f")));

    //
    // Contours
    //

    const contours = d3
        .contours()
        .size([years.length, depths.length])
        .smooth(true);

    if (showContours) {
        const values = dataset.map(d => d.t_d);
        const g = svg
            .append("g")
            .attr(
                "transform",
                `translate(${2 * margin.left - w / 2},${height -
                3 * margin.bottom -
                200}) scale(${(W + w) / years.length}, ${200 / depths.length})`
            )
            .style("stroke", "white")
            .style("stroke-width", 0.0);

        g.selectAll("path")
            .data(
                contours.thresholds(d3.range(zonalRange[0], zonalRange[1], .15))(values)
            )
            .enter()
            .append("path")
            .attr("d", geoPath)
            .style("fill", d => {                
                return color(d.value);
            })
            .style("stroke", "grey")
            .style("stroke-width", 0.0);
    }

    //
    // Heatmap
    //

    const gHeatmap = svg
        .append("g")
        .attr(
            "transform",
            `translate(,${height - 3 * margin.bottom - 200}) scale(${(W + w) /
              years.length}, ${200 / depths.length})`
        );

    gHeatmap
        .selectAll("rect")
        .data(dataset)
        .enter()
        .append("rect")
        .style("cursor", "pointer")
        .style("fill", d => (showContours ? "transparent" : color(d.t_d)))
        .style("stroke", d => color(d.t_d))
        .style("stroke-width", 0)
        .attr("x", d => {
            console.log(x((d.year)));
            return x(d.year) - w / 2;
        })
        .attr("y", d => y3(d.depth))
        .attr("width", w)
        .attr("height", y3.bandwidth())
        // .attr("class", d => `_${d.year} _${d.depth}`);
    // .on('mouseover', onMouseover)
    // .on('mouseout', onMouseout);

    //
    // Legend
    //
    const ldata = d3.range(zonalRange[0], zonalRange[1], .15);
    // console.log(ldata);
    const gLegend = svg.append("g");
    const size = [23, 20];
    const x0 = (width - size[0] * ldata.length) / 2;

    const yLegend = height - 1.5 * margin.bottom;
    const gElt = gLegend
        .selectAll("g.elt")
        .data(ldata)
        .enter()
        .append("g")
        .classed("elt", true)
        .attr(
            "transform",
            (d, i) => `translate(${x0 + i * (size[0] + 2)},${yLegend})`
        );

    gElt
        .append("rect")
        .style("fill", d => color(d))
        .style("stroke", d => color(d))
        .style("stroke-width", 1)
        .attr("width", size[0])
        .attr("height", size[1]);

    const fcol = i => {
        // console.log(i);
        if (i <= 5 || i >= ldata.length - 5) return "white";
        return "black";
    };
    gElt
        .append("text")
        .style("fill", (d, i) => fcol(i))
        .style("font", "10px sans-serif")
        .style("text-anchor", "middle")
        .style("font-weight", "normal")
        .attr("dy", "0.5em")
        .attr("x", size[0] / 2)
        .attr("y", size[1] / 2)
        .text(d => d3.format(".1f")(d));

    svg
        .append("text")
        .style("fill", "black")
        .attr("x", width / 2)
        .attr("y", yLegend + size[1])
        .attr("dy", "1em")
        .style("font", "12px sans-serif")
        .style("text-anchor", "middle")
        .style("font-weight", "normal")
        .text("Temp anomaly °C");
}