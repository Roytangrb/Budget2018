import * as d3 from 'd3'
const combine = (simulation, radiusScale)=>{
    //show exit_group
    d3.select('.exit_group').selectAll('circle').attr('visibility', 'visible')
    const forceX = d3.forceX(0).strength(0)
    const forceY = d3.forceY(0).strength(0)
    const forceR = d3.forceRadial(d=>{
        return 200 - radiusScale(d['Budget']) / 80 * 200
    }).strength(0.03)
    simulation.force("y", forceY)
    simulation.force("x", forceX)
    simulation.force("r", forceR)
}

export default combine