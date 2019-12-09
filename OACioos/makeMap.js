async function leafletmap() {

    const station = d3.csvParse(`Station,Lat,Lon
    Chrome Island ,49.472200,-124.684693,
    Baynes Sound Burke-o-Lator,49.4716,-124.7927`)

    var map = L.map('mapid').setView([49.4716, -124.7927], 11);

    L.svg().addTo(map);
    L.tileLayer("https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}@2x.png", {
        attribution: 'Wikimedia maps beta | &copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
  
    // L.tileLayer('https://services1.arcgis.com/TLdVcW1aE8FOKj1g/ArcGIS/rest/services/Bathymetry'
    // ).addTo(map);

   let topo =  L.esri.tiledMapLayer({
        url:
          'https://ags.hakai.org:6443/arcgis/rest/services/AGOL_FSs/Baynes_NOAA_Contours/MapServer/',
        maxZoom: 15
      }).addTo(map);


    //   map.addControl(topo)
    const layers = station.map(d => {
        // console.log(d);
        var circle = L.circle([+d.Lat, +d.Lon], {
                color: "orange",
                fillColor: "orange",
                fillOpacity: 0.5,
                radius: 300
            }).addTo(map)
            .bindPopup(d.Station)
            .openPopup();

    });

}

async function topomap() {


    const contoured_reprojected = await d3.json("Data/contoured_reprojected.json");

    // const svg = DOM.svg(960, 600);

    let current_circle;

    const seaCol = d3
        .scaleSequential(d3.interpolateBlues)
        .domain([-536.3748779296, 0].reverse())

    const landCol = d3
        .scaleSequential(d3.interpolateOranges)
        .domain([-100, 1551])
    // d3.select(svg)
    //     // .attr("viewBox", [0, 0, 1434, 886])
    const svg = d3.select(".topo-map")
        .append("svg")
        .attr("width", 960)
        .attr("height", 600);


        svg.attr("viewBox", [0, 0, 1434, 886])
        .selectAll("path")
        .data(contoured_reprojected)
        .enter()
        .append("path")
        .attr("d", d3.geoPath())
        .attr(
            "fill",
            d => (d.value < 0 ? seaCol(d.value) : landCol(d.value))
            // color(d.value);
        );

    mapFrameGeoJSON = JSON.parse(
        `{"type":"Feature","geometry":{"type":"LineString","coordinates":[[-124.9,49.65],[-124.5,49.4]]}}`
    )

    const projection2 = d3
        .geoAlbers()
        .rotate([126, -10]) //BC Albers
        .fitExtent([
            [0, 0],
            [1434, 886]
        ], mapFrameGeoJSON)
    // const g = svg.append('g');


    const stationCircles = svg
        // .append("g")
        .selectAll("circle")
        .data([{
                Station: "Burke-o-Lator",
                Lat: "49.4716",
                Lon: "-124.7927"
            },
            {
                Station: "Chrome Island Station",
                Lat: "49.472081",
                Lon: "-124.68437525"
            }
        ])
        .join('circle')
        .attr("transform", function (d) {
            console.log(d)
            return `translate(${projection2([d.Lon, d.Lat])})`;
        })
        .attr('fill', '#222222')
        .attr('stroke', "black")
        .attr('cx', 0)
        .attr('cy', 0)
        .attr('r', d => (d.Station === "Chrome Island Station" ? 4 : 8))
        .attr("opacity", 0.8)
        // .attr("fill", d =>
        // {console.log(d)
        //     return d.Station === "Chrome Island Station" ? "#222222" : "#aa2125";}
        // )
        .on("mouseover", function () {
            console.log(this);
            d3.select(this).attr("stroke", "#000");
        })
        .on("mouseout", function () {
            d3.select(this).attr("stroke", null);
        })
        // .on("click", function (d) {
        //     if (current_circle !== undefined) {
        //         current_circle.attr("fill", d => "#aa2125");
        //     }
        //     current_circle = d3.select(this);
        //     current_circle.attr("fill", "green");

        //     const node = svg.node();

        //     node.value = d.Station;

        //     node.dispatchEvent(new CustomEvent("input"));
        // });



    stationCircles
        .append('text')
        .attr('x', d => 15)
        .attr('y', d => d.y || 5)
        .attr('text-anchor', d => d.anchor || 'start')
        .attr('font-family', 'sans-serif')
        .attr('fill', 'none')
        .attr('stroke', 'white')
        .attr('stroke-width', '2.5')
        .attr('stroke-opacity', '0.8')
        .attr('font-size', '16px')
        .attr('pointer-events', 'none')
        // .attr('font-style', d => d.type === 'neighborhood' ? 'italic' : null)
        .text(d => d.Station);

    stationCircles
        .append('text')
        .attr('x', d => 15)
        .attr('y', d => d.y || 5)
        .attr('text-anchor', d => d.anchor || 'start')
        .attr('font-family', 'sans-serif')
        .attr('fill', '#222')
        .attr('font-size', '16px')
        .attr('pointer-events', 'none')
        // .attr('font-style', d => d.type === 'neighborhood' ? 'italic' : null)
        .text(d => d.Station);

    //   placeCircles
    //     .append('text')
    //     .text(d => d.Station)
    //     .attr('x', d => 7)
    //     .attr('y', d => 5)
    //     .attr('font-size', '18px')
    //     .attr("font-style", "italic");

    const placeCircles = svg
        .append("g")
        .selectAll("circle")
        .data([{
                Station: "Hornby Island",
                Lat: "49.52548691",
                Lon: "-124.69427922"
            },
            {
                Station: "Denman Island",
                Lat: "49.54566078",
                Lon: "-124.82052326"
            }
        ])
        .join('g')
        .attr("transform", function (d) {
            return `translate(${projection2([d.Lon, d.Lat])})`;
        });


    placeCircles
        .append('text')
        .attr('x', d => 15)
        .attr('y', d => d.y || 5)
        .attr('text-anchor', d => d.anchor || 'start')
        .attr('font-family', 'sans-serif')
        .attr('fill', 'none')
        .attr('stroke', 'white')
        .attr('stroke-width', '2.5')
        .attr('stroke-opacity', '0.8')
        .attr('font-size', '17px')
        .attr("font-style", "italic")
        .attr('pointer-events', 'none')
        // .attr('font-style', d => d.type === 'neighborhood' ? 'italic' : null)
        .text(d => d.Station);

    placeCircles
        .append('text')
        .attr('x', d => 15)
        .attr('y', d => d.y || 5)
        .attr('text-anchor', d => d.anchor || 'start')
        .attr('font-family', 'sans-serif')
        .attr('fill', '#222')
        .attr('font-size', '17px')
        .attr("font-style", "italic")
        .attr('pointer-events', 'none')
        // .attr('font-style', d => d.type === 'neighborhood' ? 'italic' : null)
        .text(d => d.Station);

}