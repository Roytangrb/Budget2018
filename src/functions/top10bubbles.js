import * as d3 from 'd3'
//sort out top 10 bubbles
const sort = (data, radiusScale, simulation, bubbles)=>{
    //hide exit_group
    d3.select('.exit_group').selectAll('circle').attr('visibility', 'hidden')
    const top10 = data.map(d=>d['Budget']).sort((a, b)=>b-a).slice(0, 10)

    const forceY = d3.forceY(d=>{
        if (d['Budget'] >=top10[9]){
            return top10.indexOf(d['Budget']) < 5? -250:-100
        } else {
            return 300
        }
    }).strength(d=>d['Budget'] >=top10[9]?0.1:0.01)

    let gap_agg = -400
    let gap = top10.map((d, i)=>{
        let r = radiusScale(d)
        if (i === 5) gap_agg = -400
        gap_agg = gap_agg + r * 2 + 30
        return gap_agg 
    })
    const forceX = d3.forceX(d=>{
        if (d['Budget'] >=top10[9]){
            let index = top10.indexOf(d['Budget'])
            return index%5?gap[index-1]:-400
        } else {
            return 0
        }
    }).strength(d=>d['Budget'] >=top10[9]?0.1:0.01)

    simulation.force("y", forceY)
    simulation.force("x", forceX)
                .alphaTarget(0.4)
                .restart()
}

export default sort