import * as d3 from 'd3'

const split = (data, simulation)=>{
    const heads = findUniqueHead(data) //82 groups, 10 col 9 rows
    const forceX = d3.forceX(d=>{
        let index = heads.indexOf(d['Head'])
        return index / 10  * 110 - 450
    }).strength(0.06)

    const forceY = d3.forceY(d=>{
        let index = heads.indexOf(d['Head'])
        return index % 10 * 100 - 350
    }).strength(0.06)
    simulation.force("y", forceY)
    simulation.force("x", forceX)
                .alphaTarget(0.6)
                .restart();
}

const findUniqueHead = (data)=>{
    const heads = []
    data.map(d=>{
        if (heads.indexOf(d['Head']) < 0){
            heads.push(d['Head'])
        }
    })
    return heads
}

export default split