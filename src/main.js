const bubblesInteractionEffects = (bubbles)=>{
    //add tooltip
    const tooltip = d3.select(".tooltip")

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
const fireSimulation = (data, radiusScale,bubbles)=>{
    //create simulation
    const strength = 0.03;
    const focusX = 0, focusY = -100

	const forceX = d3.forceX(focusX).strength(strength);
	const forceY = d3.forceY(focusY).strength(strength);
	const simulation = d3.forceSimulation()
		.force("x", forceX)
		.force("y", forceY)
        .force("collide", d3.forceCollide(d=>radiusScale(d["Budget"]) + 0.5))
    

    //fire the simulation
    simulation.nodes(data).on("tick", () =>{
        bubbles
            .attr("cx", d=>d.x)
            .attr("cy", d=>d.y)
    });
}

const switchDataSet = async (year)=>{
    let dataPath = ''
    switch(year) {
        case 18:
            dataPath = '../Data Process/2018/fin_provision/fin_provision_chi_2018.csv';
            break;
        case 17:
            dataPath = '../Data Process/2017/fin_provision/fin_provision_chi_2017.csv';
            break;
        case 16:
            dataPath = '../Data Process/2016/fin_provision/fin_provision_chi_2016.csv';
            break;
        default: return 
    }

    //reading csv
    let data = await d3.csv(dataPath, (d)=>{
        return {
            "Head": +d["總目"],
            "Programme": +d["綱領編號"],
            "Programme Name": d["綱領"],
            "Sector": d["機構"],
            "Budget": +d[`20${year}-${year+1}`], // Budget estimate, in million
            "id": `${+d["總目"]}-${d["綱領"]}-${d["機構"]}`
        }
    })
    data.columns = ["Head", "Programme", "Programme Name", "Sector", "Budget"]
    return data
}

const renderChart = (data)=>{
    const containerW = 1024, containerH = 800

    const margin = {top: 50, bottom: 30, left: 30, right: 20}
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
    const budgetMinMax = d3.extent(data.map(item => item['Budget']))
    //create buddle area raduis scale
    const radiusScale = d3.scaleSqrt().domain(budgetMinMax).range([5, 80]);

    //drawing bubbles
    const bubbles = group.selectAll(".artist")
                    .data(data, d=>d.id)
                    .enter().append("circle")
                    .attr("class", "artist")
                    .attr("r", function(d){
                        return radiusScale(d["Budget"]);
                    })
                    .attr("fill", function(d){
                        if (d["Budget"] === 0){
                            return "black"; // if provision data is 0, the bubble is filled with black color
                        }
                        return "rgba(200, 200, 200, 0.5)"
                    })

    //add interactions
    bubblesInteractionEffects(bubbles)
    //fire simulation
    fireSimulation(data, radiusScale, bubbles)
}

const initBubbles = (year)=>{
    d3.csv(`../Data Process/20${year}/fin_provision/fin_provision_chi_20${year}.csv`, (d)=>{
        return {
            "Head": +d["總目"],
            "Programme": +d["綱領編號"],
            "Programme Name": d["綱領"],
            "Sector": d["機構"],
            "Budget": +d[`20${year}-${year+1}`], // Budget estimate, in million
            "id": `${+d["總目"]}-${d["綱領"]}-${d["機構"]}`
        }
    }).then(data=>{
        data.columns = ["Head", "Programme", "Programme Name", "Sector", "Budget"]
        renderChart(data)
    })
}

//init only at large screen
if (screen.width >=1023){
    initBubbles(17)
}

//update chart
const updateChart = async (year)=>{
    let new_data = await switchDataSet(year)
    // TODO: radius scale redefine
    //find budget extent: [min, max]
    const budgetMinMax = d3.extent(new_data.map(item => item['Budget']))
    //create buddle area raduis scale
    const radiusScale = d3.scaleSqrt().domain(budgetMinMax).range([5, 80]);

    //update bubbles, bubbles re-bind to new_data
    let bubbles = d3.select('#canvas').select('g').selectAll('circle').data(new_data, d=>d.id)

    //TODO: exit grounp should be moved into cluster and show
    bubbles.exit().transition()
            .duration(2000)
            .attr('fill', 'black')
            .attr("r", 0)
            .remove();

    bubbles
        .enter()
        .append("circle")
        .attr("r", 0)
        .transition()
        .duration(2000)
        .attr("r", function(d){
            return radiusScale(d["Budget"]);
        })
        .attr('fill', 'rgba(30, 30, 255, 0.5)')
        .attr("class", "artist")
        .attr("class", "newly-added")

    //add interactions to new bubbles
    let entered_bubbles = d3.select('#canvas').select('g').selectAll('.newly-added')
    bubblesInteractionEffects(entered_bubbles)
    //refire simulation
    let all_bubbles = d3.select('#canvas').select('g').selectAll('circle')
    fireSimulation(new_data, radiusScale, all_bubbles)
}
window.updateChart = updateChart

