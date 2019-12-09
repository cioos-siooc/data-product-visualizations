function profilechart(allIOSBinned) {

    // let currLayout = 0;
    // let timer;
    // const duration = 3500;
    // const ease = d3.easeCubic;
    const pointWidth = 4;

    const margin = {
        top: 20,
        right: 30,
        bottom: 30,
        left: 40
    }
    const canvas = document.querySelector("canvas"),
        context = canvas.getContext("2d");

    const width = canvas.width,
        height = canvas.height;

    const svg = d3.select("#barsvg")
        // .append("svg")
        .attr("width", width)
        .attr("height", height);

    // svg.style("position", "absolute");
    // canvas.style.position = "absolute";


    let x = d3
        .scaleTime()
        .domain(d3.extent(allIOSBinned, d => new Date(d['time (UTC)'])))
        .range([margin.left, width - margin.right]);

    const y = d3
        .scaleLinear()
        .domain([0, d3.max(allIOSBinned, d => Number(d.bin_centre))])
        .range([margin.top, height - margin.bottom]);

    const z = d3
        .scaleSequential(d3.interpolateRdBu)
        .domain([
            d3.max(allIOSBinned, d => Math.abs(d['Temperature (degC ITS-90)'])),
            d3.min(allIOSBinned, d => Math.abs(d['Temperature (degC ITS-90)']))
        ]);

    let g = svg
        .append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).ticks(5))
        .call(g => g.select(".domain").remove())
        .attr("opacity", 1);

    svg
        .append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y))
        .call(g => g.select(".domain").remove());

        function xTime(points) {
            x = d3
              .scaleTime()
              .domain(d3.extent(allIOSBinned, d => new Date(d['time (UTC)'])))
              .range([margin.left, width - margin.right]);
        
            points.forEach(point => {
              (point.x = x(new Date(point['time (UTC)']))),
                (point.y = y(Number(point.bin_centre)));
            });
            return points;
          }

          let points = xTime(allIOSBinned);
        //   console.log(points)

        function draw() {
            context.clearRect(0, 0, width, height);
        
            for (var i = 0; i < points.length; i++) {
              let point = points[i];
              // console.log(z(10));
              context.fillStyle = 'steelblue'; //z(point['Temperature (degC ITS-90)']);
              context.fillRect(point.x, point.y, pointWidth, pointWidth);
              context.fill();
              context.stroke();
            }
          }

          draw();

}