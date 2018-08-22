import * as d3 from 'd3'

const addToolTips = (bubbles)=>{
    //add tooltip
    const tooltip = d3.select(".tooltip")

    bubbles
        .on("mouseover",d=>{
                tooltip.html(`${d["Programme Name"]}<br>${d['Sector']}<br>${d['Budget']}百萬`)
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
        //add click show full details
        .on('click', (d)=>{
            let head = d["Head"];
            //clear previous selected head group
            bubbles.attr("stroke-width", 0);
            bubbles.each(function(d){
                if(d["Head"] === head){
                    d3.select(this).attr("stroke", "black").attr("stroke-width", 3);
                }
            });
        })
}

export default addToolTips