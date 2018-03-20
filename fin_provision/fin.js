function fin() {
	var margin = {top: 30, bottom: 30, left: 30, right: 20};
	var width = 1280 - margin.left - margin.right, height = 1400 - margin.top - margin.bottom;

	var container = d3.select(".chart")
					.attr("height", height + margin.top + margin.bottom)
					.attr("width", width  + margin.left + margin.right);
	var canvas = d3.select("#canvas1")
					.attr("height", height + margin.top + margin.bottom)
					.attr("width", width  + margin.left + margin.right);
	//indent the group to create margin
	var group = canvas.append("g")
				.attr("transform", "translate(" + width / 2 + ", " + height / 2 + ")");
				//.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	//2016-17-Actual financial provision [0, 53443.6] in million HKD
	var radiusScale = d3.scaleSqrt().domain([0, 53443.6]).range([5, 80]);
	var colorScale = d3.scaleOrdinal(d3.schemeCategory20c);
	var hueScale = d3.scaleSequential(d3.interpolateYlGnBu).domain([0, 53443.6]);

	//simulation is a collection of forces about where we want our circles to go
	//and how we want our circles to interact
	//so we need to give forces to our simulation
	//1. get the bubbles forced to the center of the group
	//2. make the bubbles not collide
	var strength = 0.03;
	var grpLabel = group.append("text")
				.attr("x", 0)
				.attr("y", -height/2 + 20)
				.attr("text-anchor", "middle")
				.attr("style", "font-size:20px")
				.attr("visibility", "visible");

	var forceX = d3.forceX(0).strength(strength);
	var forceY = d3.forceY(-400).strength(strength);

	var simulation = d3.forceSimulation()
		.force("x", forceX)
		.force("y", forceY)
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
	//try different sets of data
		.defer(d3.csv, "fin_provision1_cateLabel_sorted.csv")
		.defer(d3.csv, "HeadAdded/fin_provision_2018_head83.csv")
		.defer(d3.csv, "HeadAdded/fin_provision_2017_head83.csv")
		.defer(d3.csv, "HeadAdded/fin_provision_2016_head83.csv")
		.defer(d3.csv, "HeadAdded/fin_provision_2015_head82.csv")
		.await(ready)

	function ready(error, data18_1, data18, data17, data16, data15){
		if (error) throw error;

		//test log
		console.log(data18);
		console.log(data17);
		console.log(data16);
		console.log(data15);
		var data = data18_1;

		var headKeys = d3.map(data, function(d) {return d["Head"];}).keys();
		console.log("Head groups: " + headKeys);

		var bubbles = group.selectAll(".artist")
			.data(data, data["Head"])
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
			}) // need to change the color according to the category(0 expense highlight)
			
			//filter out same group bubbles and add stroke
			.on("click", clicked);
			function clicked (d){
				console.log(d);
				grpLabel.html(d["HeadName"]);
				bubbles.attr("stroke-width", 0);
				var grp = d["Head"];
				bubbles.each(function(d){
					if(d["Head"] === grp){
						d3.select(this).attr("stroke", "black").attr("stroke-width", 3);
					}
				});
			}

			//add tooltip
			bubbles
      			.on("mouseover", function(d) {
              		tooltip.html(d["Programme Name"] + "</br>" + "Expense: " +
               					d["2016-17-Actual"] + " million HK$" +"</br>"+ "Head Group: " + d["Head"]);
              		tooltip.style("visibility", "visible");
      				})
      			.on("mousemove", function() {
          			return tooltip.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");
      				})
      			.on("mouseout", function(){return tooltip.style("visibility", "hidden");});

      	//listen for change data set
      	/*data update section start*/
      	function changeDataSet(year){
      		var new_data;
      		var actualName = "";

      		if(year === 15)  new_data = data15;
      		if(year === 16)  new_data = data16;
      		if(year === 17)  new_data = data17;
      		//temp for 2018
      		if(year === 18)  new_data = data18_1;
      		actualName = "20"+(year-2)+"-"+(year-1)+"-Actual";
      		bubbles.data(new_data, new_data["Head"]).transition().duration(2000)
      				.attr("r", function(d){
							return radiusScale(+d[actualName]);
					})
					.attr("fill", function(d){
						if (+d[actualName] === 0){
							return "red"; 
						}
						return hueScale(+d[actualName]);
					});
			
			//fire the simulation again
			simulation.nodes(new_data)
			.on("tick", ticked);
			//reset collide force
			simulation.force("collide", d3.forceCollide(function(d){
				return radiusScale(+d[actualName]) + 0.5;
			}))
				.alphaTarget(0.1)
      			.restart();
      	}
      	d3.select("#Data2015").on("click", function(){
      		changeDataSet(15);
      		console.log("2015 data is updated");
      	});
      	d3.select("#Data2016").on("click", function(){
      		changeDataSet(16);
      		console.log("2016 data is updated");
      	});
      	d3.select("#Data2017").on("click", function(){
      		changeDataSet(17);
      		console.log("2017 data is updated");
      	});
      	d3.select("#Data2018").on("click", function(){
      		changeDataSet(18);
      		console.log("2018 data is updated");
      	});
      	/*data update section end*/

      	//listener of button
      	d3.select("#combine").on("click", function(){
      		console.log("combine");
      		grpLabel.attr("visibility", "visible");
      		d3.selectAll(".clusterLabel").attr("visibility", "hidden");

      		forceX = d3.forceX(0).strength(strength);
      		forceY = d3.forceY(-400).strength(strength);
      		simulation.force("x", forceX).force("y", forceY)
      			.alphaTarget(0.05)
      			.restart();
      	});

      	d3.select("#split").on("click", function(){
      		//temp code to change back to split function
      		changeDataSet(18);

      		console.log("split");
      		grpLabel.attr("visibility", "hidden");
      		var rowIndex, row, colIndex, col;
      		//append title for each when split
      		var appendClusterLabel = function (x, y, word){
      			group.append("text")
      				.attr("class", "clusterLabel")
      				.attr("text-anchor", "middle")
      				.attr("x", x).attr("y", y)
      				.attr("font-size", 12).html(word);
      			};

      		forceX = d3.forceX(function(d){
      					rowIndex = Math.floor(+d["CateSumOrder"] % 5);
      					row = Math.floor(+d["CateSumOrder"] % 5) * width / 5 - 550;
      					
      					if (+d["CateSumOrder"] === 25){
      						row =  row + 100;
      					} else if (+d["CateSumOrder"] === 26){
      						row =  row + 300;
      					}
      					return row;
					}).strength(function(d){
						if (+d["CateSumOrder"] === 26){
      						return  0.02;
      					}
						return strength;
					});

      		forceY = d3.forceY(function(d){
      			colIndex = Math.floor(+d["CateSumOrder"] / 5);
      			col = Math.floor(+d["CateSumOrder"] / 5) * height/6 - 600;

      			/*append label*/
      			var temp_row = Math.floor(+d["CateSumOrder"] % 5) * width / 5 - 550;
      			var x_offset = 10;
      			var y_offset = 50;
      			//console.log(d["CateSumOrder"] + ": " + d["HeadName"]);
      			if (+d["CateSumOrder"] === 26){
      				x_offset = 50;
      			}
      			
      			if (+d["Head"] === 142){
      				x_offset = 0;
      				y_offset=70;
      				appendClusterLabel(temp_row + x_offset, col - y_offset, "<tspan x="+(-25)+" dy="+1.2+"em>Government Secretariat: Offices of</tspan>"
      																		+"<tspan x="+(-25)+" dy="+1.2+"em>the Chief Secretary for Administration</tspan>"
      																		+"<tspan x="+(-25)+" dy="+1.2+"em>and the Financial Secretary</tspan>");
      			}
      			
      			else if (+d["Head"] === 169){
      				x_offset = 0;
      				y_offset= 60;
      				appendClusterLabel(temp_row + x_offset, col - y_offset, "<tspan x="+(-325)+" dy="+1.2+"em>Secretariat, Commissioner on Interception of </tspan>"
      																		+"<tspan x="+(-325)+" dy="+1.2+"em>Communication and Surveillance</tspan>");
      			} 

      			else {appendClusterLabel(temp_row + x_offset, col - y_offset, d["HeadName"]);}
      			/*append label*/

      			if (+d["CateSumOrder"] === 26 || +d["CateSumOrder"] === 25){
      				col = col + 50;
      			}
      			
      			return col;
      			
      		}).strength(function(d){
						if (+d["CateSumOrder"] === 26){
      						return  0.02;
      					}
						return strength;
					});
      		simulation.force("y", forceY);
      		simulation.force("x", forceX)
      			.alphaTarget(0.4)
      			.restart();
      	});

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

		console.log("update2 20, March 2018, split and combine function is now only applicable to 2018's data, so when clicked the bubbles should 2018' data");
	}

}