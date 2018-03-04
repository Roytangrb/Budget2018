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
	var hueScale = d3.scaleSequential(d3.interpolateYlGnBu).domain([0, 53443.6]);

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

	
	var tooltip = d3.select("body")
    .append("div")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("visibility", "hidden")
    .style("color", "white")
    .style("padding", "8px")
    .style("background-color", "rgba(0, 0, 0, 0.75)")
    .style("border-radius", "6px")
    .style("font", "12px sans-serif")
    .html("tooltip");

	d3.queue()
		.defer(d3.csv, "finProvision.csv")
		.await(ready)

	function ready(error, data){
		if (error) throw error;

		var headKeys = d3.map(data, function(d) {return d["Head"];}).keys();
		console.log("Head groups: " + headKeys);

		var bubbles = group.selectAll(".artist")
			.data(data)
			.enter().append("circle")
			.attr("class", "artist")
			.attr("r", function(d){
				return radiusScale(+d["2016-17-Actual"]);
			})
			.attr("fill", function(d){
				if (+d["2016-17-Actual"] === 0){
					return "red"; // if provision data is 0, the bubble is filled with black color
				}
				return hueScale(+d["2016-17-Actual"]);
				//colorScale(d["Head"]);
			}) // need to change the color according to the category(0 expense highlight)
			
			//filter out same group bubbles and add stroke
			.on("click", function(d){
				bubbles.attr("stroke-width", 0);
				var grp = d["Head"];
				bubbles.each(function(d){
					if(d["Head"] === grp){
						d3.select(this).attr("stroke", "black").attr("stroke-width", 3);
					}
				});
				console.log(d);
			});

			//add tooltip
			bubbles
      			.on("mouseover", function(d) {
              		tooltip.html(d["Programme Name"] + "</br>" + "Expense: " +
               					d["2016-17-Actual"] + " million HK$" +"</br>"+ "Group: " + d["Head"]);
              		tooltip.style("visibility", "visible");
      				})
      			.on("mousemove", function() {
          			return tooltip.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");
      				})
      			.on("mouseout", function(){return tooltip.style("visibility", "hidden");});


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