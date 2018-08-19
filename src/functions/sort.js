import * as d3 from 'd3'
const sort = (simulation, radiusScale)=>{
    const forceX = d3.forceX(d=>{
        let radius = radiusScale(d['Budget'])
        return radius < 40? -200 : 200
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
                .alphaTarget(0.5)
                .restart();
}

export default sort