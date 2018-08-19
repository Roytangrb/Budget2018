//reading csv
d3.csv('../Data Process/1819/fin_provision/fin_provision_chi.csv', (d)=>{
    return {
        "Head": +d["總目"],
        "Programme": +d["綱領編號"],
        "Programme Name": d["綱領"],
        "Sector": d["機構"],
        "1819Budget": +d["2018-19"] // Budget estimate, in million
    }
}).then(data=>{
    data.columns = ["Head", "Programme", "Programme Name", "Sector", "1819Budget"]
    renderChart(data)
})

const renderChart = (data)=>{
    const containerW = 1280, containerH = 1400

    const margin = {top: 30, bottom: 30, left: 30, right: 20}
	const width = containerW - margin.left - margin.right, height = containerH - margin.top - margin.bottom

	const container = d3.select(".chart-container")
                        .attr("width", containerW)
                        .attr("height", containerH)
    //margin applied to canvas
    const canvas = d3.select("#canvas")
                    .attr("width", width)
                    .attr("height", height)
                    .attr("transform", `translate(${margin.left}, ${margin.top})`)

	const group = canvas.append("g")
				.attr("transform", `translate(${width/2}, ${height/2})`);


}