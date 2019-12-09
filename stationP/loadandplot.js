async function loadplotdata() {

    const summaryData =
        await d3.csv("Data/p26_temp_final_long.csv", d3.autoType);

    // make bar chart
    chart(summaryData)


    const allIOSData =
        await d3.csv("Data/allIOSBinned.csv", d3.autoType);

        // plot all profiles    
        profilechart(allIOSData);    

        //plot annual
    const scatter1data =   summaryData.filter(d => d.Depth === "0-10 dbar");

    makescatter(scatter1data);
}