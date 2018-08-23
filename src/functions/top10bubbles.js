//sort out top 10 bubbles
const sort = (data, radiusScale, simulation, bubbles)=>{
    const top10 = data.map(d=>d['Budget']).sort((a, b)=>b-a).slice(0, 10)
    bubbles
        .filter(d=>d['Budget'] <top10[9])
        .transition()
        .duration(1000)
        .attr('r', 0)

    bubbles
        .filter(d=>d['Budget'] >=top10[9])
        .transition()
        .duration(2000)
        .attr('cy', d=>top10.indexOf(d['Budget']) < 5? -250:-100)
        .attr('cx', d=>top10.indexOf(d['Budget']) < 5?(top10.indexOf(d['Budget'])+1) * 200 - 600 : (top10.indexOf(d['Budget'])-4) * 200 - 600)

    simulation.force('x').strength(0)
    simulation.force('y').strength(0)
}

export default sort