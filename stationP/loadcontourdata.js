async function loaddata(months_to_include,showContours) {

    //  
    const makeBins = d3.bin().value(d => d.depth);

    const stationP = await d3.csv(
        "Data/papa_all.csv",
        // "https://gist.githubusercontent.com/Mbrownshoes/7f08c0aa283d79e096091b849dd5c03d/raw/585ce204e7ca0b0036bacc6d3840a8f876e70cac/papa_all.csv",
        d3.autoType
    );
    // console.log(stationP);

    const stationP_clean = stationP
        .map(d => {
            d.year = Number(d.year);
            d.yymm = d.year + "-" + d.month;
            return d;
        })
        .filter(
            d =>
            Number(d.month) >= months_to_include[0] &&
            Number(d.month) <= months_to_include[1] &&
            d.year !== 2019
        );


    const binnedByYear = bindByYear();

    const baseline = calcBaseline(stationP_clean);


    const smallData = binnedByYear
        .filter(d => d.value !== undefined)
        .map(d => {
            const dp =
                d.binH < 10 ? Math.floor(d.binH / 1) * 1 : Math.floor(d.binH / 10) * 10;
            // console.log(dp, baseline[dp]);

            return {
                ave_d: d.depth,
                depth: dp,
                year: Number(d.year),
                temp: d.temp,
                base: baseline[dp],
                t_d: d.temp - baseline[dp]
            };
        })
        .sort((a, b) => a.depth - b.depth)


    makeContour(smallData,showContours)

    function calcBaseline(data) {
        const t_avg = {};
        const bins = makeBins
            .domain([0, 1000])
            .thresholds([0, 100, 200, 300, 400, 500, 600, 700, 800, 900])(
                data.filter(d => d.year >= 1971 && d.year <= 2010)
            );
        // console.log(bins);

        bins.forEach(b => {
            t_avg[b.x1] = d3.mean(b.map(d => d.temp));
        });

        return t_avg;
    }


    function bindByYear() {

        const out = [];
        d3.map(stationP_clean, d => d.year)
            .keys()
            .forEach(year => {
                const an_bins = makeBins.domain([0, 1000])
                    .thresholds([0, 100, 200, 300, 400, 500, 600, 700, 800, 900])
                    (stationP_clean.filter(d => d.year === Number(year)));
                // console.log(an_bins)
                an_bins.year = year;
                an_bins.map(bin => {
                    out.push({
                        depth: Math.round(d3.mean(bin.map(d => d.depth))),
                        temp: d3.mean(bin.map(d => d.temp)),
                        year: year,
                        binH: bin.x1,
                        binL: bin.x0,
                        value: d3.mean(bin.map(d => d.depth))
                    });
                });
            });
        return out;

    }

};