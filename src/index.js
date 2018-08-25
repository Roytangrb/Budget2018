//import main.css
import './main.css'
//import library
import * as d3 from "d3"
import sort from './functions/sort';
import split from './functions/splitByHead';
import combine from './functions/combine';
import addInteraction from './functions/addInteraction'
import top10 from './functions/top10bubbles'

const fireSimulation = (data, radiusScale,bubbles)=>{
    //create simulation
    const strength = 0.03;
    const focusX = 0, focusY = -100

	const forceX = d3.forceX(focusX).strength(strength);
	const forceY = d3.forceY(focusY).strength(strength);
	const simulation = d3.forceSimulation()
		.force("x", forceX)
		.force("y", forceY)
        .force("collide", d3.forceCollide(d=>radiusScale(d["Budget"]) + 1))

    //fire the simulation
    simulation.nodes(data).on("tick", () =>{
        bubbles
            .attr("cx", d=>d.x)
            .attr("cy", d=>d.y)
    });
    
    return simulation
}

const switchDataSet = async (year)=>{
    //TODO: Validation
    let dataPath = `data/20${year}/fin_provision/fin_provision_chi_20${year}.csv`

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

const launchFuncs = (bubbles, data, radiusScale, simulation)=>{
    //add interactions
    addInteraction(bubbles)
    const sortButton = document.querySelector('#sort')
    sortButton.addEventListener('click', (event)=>{sort(simulation, radiusScale)})

    //listen for split 
    const splitButton = document.querySelector('#splitToGroup')
    splitButton.addEventListener('click', (event)=>{split(data, simulation, radiusScale)})

    //listen for combine
    const combineButton = document.querySelector('#combine')
    combineButton.addEventListener('click', event=>{combine(simulation, radiusScale)})

    //listen for top10 sort
    const top10button = document.querySelector('#top10')
    top10button.addEventListener('click', event=>{top10(data, radiusScale,simulation, bubbles)})
}

const renderChart = (data)=>{
    const containerW = document.querySelector('body').offsetWidth
    const containerH = 1400

    const margin = {top: 0, bottom: 30, left: 30, right: 20}
	const width = containerW - margin.left - margin.right, height = containerH - margin.top - margin.bottom
    const centerTranslateY = 400
	const container = d3.select(".chart-container")
                        .attr("width", containerW)
                        .attr("height", containerH)
    //margin applied to canvas
    const canvas = d3.select("#canvas")
                    .attr("width", width)
                    .attr("height", height)
                    .attr("transform", `translate(${margin.left}, ${margin.top})`)

	const group = canvas.append("g")
				.attr("transform", `translate(${width/2}, ${centerTranslateY})`);

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
    //fire simulation, pass to other functions
    const simulation = fireSimulation(data, radiusScale, bubbles)
    launchFuncs(bubbles, data, radiusScale, simulation)
}

const initBubbles = (year)=>{
    window.year = year
    d3.csv(`data/20${year}/fin_provision/fin_provision_chi_20${year}.csv`, (d)=>{
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

//update chart
const updateChart = async (year)=>{
    let new_data = await switchDataSet(year)
    // TODO: radius scale redefine
    //find budget extent: [min, max]
    const budgetMinMax = d3.extent(new_data.map(item => item['Budget']))
    //create buddle area raduis scale
    const radiusScale = d3.scaleSqrt().domain(budgetMinMax).range([5, 80]);

    //update bubbles, bubbles re-bind to new_data
    let bubbles = d3.select('#canvas').select('g').selectAll('circle')
                    .data(new_data, function(d){
                        return d.id
                    })

    //TODO: exit grounp should be moved into cluster and show
    bubbles
        .exit()
        .transition()
        .duration(2000)
        .attr('fill', 'black')
        .attr("r", 0)
        .remove();

    bubbles
        .enter()
        .append("circle")
        .attr("r", 0)
        .attr("class", "artist")
        .attr('class', 'newly-added')
      .merge(bubbles)
        .transition()
        .duration(2000)
        .attr("r", function(d){
            return radiusScale(d["Budget"]);
        })

    d3.select('#canvas').select('g').selectAll('.newly-added')
        .attr('fill', 'rgba(30, 30, 255, 0.5)')

    bubbles = d3.select('#canvas').select('g').selectAll('circle')
   
    const simulation = fireSimulation(new_data, radiusScale, bubbles)
    //relaunch funcs
    launchFuncs(bubbles, new_data, radiusScale, simulation)
    
}

//init only at large screen
if (screen.width >=1023){
    initBubbles(15)
}
//listener for year change
const select = document.querySelector('#yearOptions')
const onChangeHandler = ()=>{
    let year = +select.options[select.selectedIndex].value
    window.year = year
    updateChart(year)
    //restore language to chi
    document.querySelector('#languageSwitch').value = 'chi'
    d3.select('#head p').html('')
}
select.addEventListener('change', onChangeHandler)


