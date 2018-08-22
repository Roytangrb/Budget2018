import * as d3 from 'd3'
import heads from '../../data/heads_chi.json'

const addToolTips = (bubbles)=>{
    //add tooltip
    const tooltip = d3.select(".tooltip")
    bubbles
        .on("mouseover",function(d){
                tooltip.html(`${d["Programme Name"]}<br>${d['Sector']}<br>${d['Budget']}百萬`)
                tooltip.style("visibility", "visible");
                //hover fill
                //d3.select(this).transition().duration(300).attr('fill', 'rbga(50, 50, 200, 0.7)')
            }
        )
        .on("mousemove", ()=>{
                tooltip
                    .style("top", `${d3.event.pageY-10}px`)
                    .style("left",`${d3.event.pageX+10}px`);
            }
        )
        .on("mouseout", function(d){
                tooltip.style("visibility", "hidden")
                //cancel hover fill
                //d3.select(this).transition().duration(300).attr('fill', 'rbga(200, 200, 200, 0.5)')
            }
        )
        //add click show full details
        .on('click', (d)=>{
            let head = d["Head"];
            d3.select('#head p').html(`總目：${heads[head]}`)
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