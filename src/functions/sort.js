import * as d3 from 'd3'
const sort = (simulation, radiusScale)=>{
    //put exti bubbles into horizontal alignment
    makeExitHorizontal()
    const forceX = d3.forceX(d=>{
        let radius = radiusScale(d['Budget'])
        return radius < 40? -250 : 250
    }).strength(d=>{
        let radius = radiusScale(d['Budget'])
        return radius < 40? 0.01 : 0.05
    })

    const forceY = d3.forceY().strength(d=>{
        let radius = radiusScale(d['Budget'])
        return radius < 40? 0.01 : 0.05
    })

    simulation.force("y", forceY)
    simulation.force("x", forceX)
                .alphaTarget(0.3)
                .restart();
}

const makeExitHorizontal = ()=>{
    let gap = 50
    let count = 0
    d3.select('#canvas').select('.exit_group').selectAll('circle')
            .transition()
            .duration(2000)
            .attr('cy', 100)
            .attr('cx', d=>{
                let temp = gap + d.r + ++count * 10
                gap += 2 * d.r
                return temp
            })
}

export default sort