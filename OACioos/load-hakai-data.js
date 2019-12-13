// start date of plot. Last 7 days.
const today = new Date(new Date().setDate(new Date().getDate()));
const st = new Date(today.setDate(today.getDate() - 7));

async function loadHakai() {

    const berkData = await d3.json(
        "https://catalogue.hakai.org/erddap/tabledap/HakaiBaynesSoundBoL5min.json?time%2Clatitude%2Clongitude%2CpCO2_uatm_Avg%2CTSG_T_Avg%2CTSG_S_Avg%2CAlkS_Avg%2CcalcOmegaCalcite_Avg%2CcalcpH_Avg&time%3E=" +
        st.toLocaleDateString("en-GB", {
            year: "numeric"
        }) +
        "-" +
        st.toLocaleDateString("en-GB", {
            month: "2-digit"
        }) +
        "-" +
        st.toLocaleDateString("en-GB", {
            day: "2-digit"
        }) +
        "T00%3A00%3A00Z",
        d3.autoType
    );

    const climatology =
        await d3.csv("Data/ChromeIsland_climatological_SST_90th_10th_percentile@4.csv",
            d3.autoType);

    // get date from DOY
    function dateFromDay(year, day) {
        var date = new Date(year, 0); // initialize a date in `year-01-01`
        return new Date(date.setDate(day)); // add the number of days
    }

    climTemp = climatology.map(({
        ...row
    }) => {
        row.date = dateFromDay(2019, row.doy);
        return row;
    })

    // restructure to plot
    const colNames = berkData.table.columnNames;
    berkData.table.rows.forEach(function (d, i) {
        colNames.forEach(function (dd, ii) {
            d[colNames[ii]] = d[ii];
        });
        d.splice(0, 12);
    });

    const cleanedData = berkData.table.rows;


    const combinedData = cleanedData.map(({
        ...row
    }) => {
        let testdate = new Date(row.time);
        let t2 =
            testdate.getMonth() +
            1 +
            '-' +
            testdate.getDate() +
            '-' +
            testdate.getFullYear();

        // let testdate = new Date(row.time);

        let t23 =
            testdate.getFullYear() +
            '-' + (testdate.getMonth() +
                1) +
            '-' +
            testdate.getDate()

        var month = new Date(row.time).getUTCMonth() + 1; //months from 1-12
        var day = new Date(row.time).getUTCDate();
        var year = new Date(row.time).getUTCFullYear();

        newdate = year + "-" + month + "-" + day;
        // console.log(newdate, new Date(new Date(newdate).setHours(0,0,0,0)), new Date(t2),climTemp[0].date)


        let result = climTemp.filter(
            d => d.date.getTime() === new Date(new Date(newdate).setHours(0, 0, 0, 0)).getTime()
        );
        // console.log(new Date(t23),new Date(t2), climTemp[0].date);
        row.mean = result[0]['mean'];
        row.per90 = result[0]['90thper'];
        row.ph10 = result[0]['ph'];
        row.omega_calc_10p = result[0]['omega_calc_10p'];
        return row;
    });


    // update with last reading. Color based on thresholds
    function makeAlertBoxes() {

        d3.select("#temperature")
            .html(() => combinedData[0].TSG_T_Avg !== null ? combinedData[0].TSG_T_Avg.toFixed(2) : "N/A")
            .style("background", () =>
                combinedData[0].TSG_T_Avg === null ? "red" : combinedData[0].TSG_T_Avg < combinedData[0].per90 ? "#b9f6ca" : 'rgba(255, 200, 200, 0.5)'
            );

        d3.select("#pH")
            .html(() => combinedData[0].calcpH_Avg !== null ? combinedData[0].calcpH_Avg.toFixed(2) : "N/A")
            .style("background", () =>
                combinedData[0].calcpH_Avg === null ? "red" : combinedData[0].calcpH_Avg > 7.69 ? "#b9f6ca" : 'rgba(255, 200, 200, 0.5)'
            );

        d3.select("#calciteSat")
            .html(() => combinedData[0].calcOmegaCalcite_Avg !== null ? combinedData[0].calcOmegaCalcite_Avg.toFixed(2) : "N/A")
            .style("background", () =>
                combinedData[0].calcOmegaCalcite_Avg === null ? "red" : combinedData[0].calcOmegaCalcite_Avg > 1 ? "#b9f6ca" : 'rgba(255, 200, 200, 0.5)'
            );

    }


    // Big boxes!
    makeAlertBoxes();

    // time series charts
    // Berkolator parameters to plot     
    hakai_chart(combinedData, ["TSG_T_Avg", "calcpH_Avg", "calcOmegaCalcite_Avg"]);

    // add the map
    leafletmap()

    // topomap()
}

loadHakai();