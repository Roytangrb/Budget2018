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

const bubblesInteractionEffects = (bubbles)=>{
    //add text label
    bubbles.append("text")
        .attr("dy", "0.5em")
        .style("text-anchor", "middle")
        .text(d=>d["Programme Name"])

    //add tooltip
    const tooltip = d3.select("body").append("div").attr('class', 'tooltip')

    bubbles
        .on("mouseover",d=>{
                tooltip.html(d["Programme Name"]);
                tooltip.style("visibility", "visible");
            }
        )
        .on("mousemove", ()=>{
                tooltip
                    .style("top", `${d3.event.pageY-10}px`)
                    .style("left",`${d3.event.pageX+10}px`);
            }
        )
        .on("mouseout", ()=>{
            tooltip.style("visibility", "hidden")
            }
        )

}

const renderChart = (data)=>{
    const containerW = 1280, containerH = 800

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

    //find budget extent: [min, max]
    const budgetMinMax = d3.extent(data.map(item => item['1819Budget']))
    //create buddle area raduis scale
    const radiusScale = d3.scaleSqrt().domain(budgetMinMax).range([5, 80]);


    //create simulation
    const strength = 0.03;
    const focusX = 0, focusY = -100

	const forceX = d3.forceX(focusX).strength(strength);
	const forceY = d3.forceY(focusY).strength(strength);
	const simulation = d3.forceSimulation()
		.force("x", forceX)
		.force("y", forceY)
        .force("collide", d3.forceCollide(d=>radiusScale(d["1819Budget"]) + 0.5))
    
    //drawing bubbles
    const bubbles = group.selectAll(".artist")
                    .data(data, data["Head"])
                    .enter().append("circle")
                    .attr("class", "artist")
                    .attr("r", function(d){
                        return radiusScale(d["1819Budget"]);
                    })
                    .attr("fill", function(d){
                        if (d["1819Budget"] === 0){
                            return "black"; // if provision data is 0, the bubble is filled with black color
                        }
                        return "rgba(200, 200, 200, 0.5)"
                    })
    
    //fire the simulation
    simulation.nodes(data).on("tick", () =>{
        bubbles
            .attr("cx", function(d){
                return d.x;
            })
            .attr("cy", function(d){
                return d.y;
            })
    });

    //add interactions
    bubblesInteractionEffects(bubbles)
}