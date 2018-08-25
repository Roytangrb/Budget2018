import * as d3 from 'd3'
import addInteraction from './addInteraction'
const isolateExit = (bubbles, radiusScale)=>{
    d3.select('#canvas').select('.exit_group').selectAll('circle')
        .transition()
        .duration(1000)
        .attr('r', 0)
        .remove()

    let exit_data =[] 
    bubbles
        .exit()
        .transition()
        .duration(2000)
        .attr('fill', 'black')
        .attr("r", function(d){
            exit_data.push({
                'r': radiusScale(d['Budget']),
                "Head": d["Head"],
                "Programme": d["Programme"],
                "Programme Name": d["Programme Name"],
                "Sector": d["Sector"],
                "Budget": d['Budget'],
                "id": `${+d["Head"]}-${d["Programme Name"]}-${d["Sector"]}`
            })
            return 0
        })
        .remove();
        //sort data
        exit_data = exit_data.sort((a, b)=>b.r-a.r)
        let gap = 50
        const group = d3.select('#canvas').select('.exit_group')
        const exit_bubbles = group.selectAll('circle')
            .data(exit_data, d=>d.id)
            .enter()
            .append('circle')
            .attr('cx', 100)
            .attr('cy', d=>{
                let temp = gap + d.r + exit_data.indexOf(d) * 10
                gap += 2 * d.r
                return temp
            })
            .attr("fill", "rgb(0, 0, 0)")
            .style('opacity', 0.5)
            .attr('r', 0)
        
        exit_bubbles
            .transition()
            .duration(2000)
            .attr("r", function(d){
                return d.r
            })

        addInteraction(exit_bubbles)
}
export default isolateExit