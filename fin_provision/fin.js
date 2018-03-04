function fin() {
	var margin = {top: 30, bottom: 30, left: 30, right: 20};
	var width = 960 - margin.left - margin.right, height = 960 - margin.top - margin.bottom;

	var canvas = d3.select("#canvas1")
					.attr("height", height + margin.top + margin.bottom)
					.attr("width", width  + margin.left + margin.right);
	//indent the group to create margin
	var group = canvas.append("g")
				.attr("transform", "translate(" + width / 2 + ", " + height / 2 + ")");
				//.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	//2016-17-Actual financial provision [0, 53443.6] in million HKD
	var radiusScale = d3.scaleSqrt().domain([0, 53443.6]).range([5, 100]);
	var colorScale = d3.scaleOrdinal(d3.schemeCategory20c);
	//simulation is a collection of forces about where we want our circles to go
	//and how we want our circles to interact
	//so we need to give forces to our simulation
	//1. get the bubbles forced to the center of the group
	//2. make the bubbles not collide

	var simulation = d3.forceSimulation()
		.force("x", d3.forceX(0).strength(0.05))
		.force("y", d3.forceY(0).strength(0.05))
		//2. not collide forceCollide give the radius to avoid collide
		.force("collide", d3.forceCollide(function(d){
			return radiusScale(+d["2016-17-Actual"]) + 0.5;
		}));

	
	var bubble = d3.pack()
			.size([width, height])
			.padding(1.5);

	d3.queue()
		.defer(d3.csv, "finProvision.csv")
		.await(ready)

	function ready(error, data){
		if (error) throw error;

		var bubbles = group.selectAll(".artist")
			.data(data)
			.enter().append("circle")
			.attr("class", "artist")
			.attr("r", function(d){
				return radiusScale(+d["2016-17-Actual"]);
			})
			.attr("fill", function(d){
				return colorScale(d["Head"]);
			}) // need to change the color according to the category(0 expense highlight)
			.on("click", function(d){
				console.log(d);
			})


		//add text label
		bubbles.append("text")
			.attr("dy", "0.5em")
			.style("text-anchor", "middle")
			.text(function(d){
				return d["Programme Name"];
			});
		//feed the data into the simulation, it will update the position of nodes by certain time interval
		simulation.nodes(data)
			.on("tick", ticked) //fire the ticked function code on every tick

		function ticked() {
			bubbles
			.attr("cx", function(d){
				return d.x;
			})
			.attr("cy", function(d){
				return d.y;
			})
		}

		console.log("update 4, March 2018");
	}
}