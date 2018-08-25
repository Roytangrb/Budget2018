import * as d3 from 'd3'

const split = (data, simulation)=>{
    //hide exit_group
    d3.select('.exit_group').selectAll('circle').attr('visibility', 'hidden')
    const window_width = document.querySelector('body').offsetWidth
    const heads = findUniqueHead(data) //82 groups, 8 col 11 rows
    const forceX = d3.forceX(d=>{
        let index = heads.indexOf(d['Head'])
        return index % 8  * 110 - window_width/2 + 100
    }).strength(0.06)

    const forceY = d3.forceY(d=>{
        let index = heads.indexOf(d['Head'])
        return Math.floor(index / 10) * 100 - 350
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