import * as d3 from 'd3'
import heads_chi from '../../data/heads_chi.json'
import heads_eng from '../../data/heads_eng.json'

const addInteraction = (bubbles)=>{
    //listen for language
    let isChi = true
    let heads = heads_chi
    let eng_tooltip_text = null
    const lang_switch = document.querySelector('#languageSwitch')
    lang_switch.addEventListener('change', (event)=>{
        isChi = lang_switch.options[lang_switch.selectedIndex].value === 'chi'
        heads = isChi? heads_chi:heads_eng
        d3.select('#head p').html('')
        bubbles.attr("stroke-width", 0);

        if (!isChi){
            requestForEngProgrammeText().then(data=>{
                eng_tooltip_text = data
            })
        }
    })
    //add tooltip
    const tooltip = d3.select(".tooltip")
    bubbles
        .on("mouseover",function(d){
                let html =''
                if (isChi){
                    html = `${d["Programme Name"]}<br>${d['Sector']}<br>${d['Budget']} 百萬`
                } else {
                    let datum = filterByHeadAndProgramme(eng_tooltip_text, d['Head'], d['Programme'])
                    html = `${datum["Programme Name"]}<br>${datum['Sector']}<br>${d['Budget']} million`
                }
                
                tooltip.html(html)
                tooltip.style("visibility", "visible");
                //hover fill
                d3.select(this).transition().duration(300).style('opacity', 1)
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
                d3.select(this).transition().duration(300).style('opacity', 0.5)
            }
        )
        //add click show full details
        .on('click', (d)=>{
            let head = d["Head"];
            d3.select('#head p').html(`${isChi?'總目： ':'Head: '}${heads[head]}`)
            //clear previous selected head group
            bubbles.attr("stroke-width", 0);
            bubbles.each(function(d){
                if(d["Head"] === head){
                    d3.select(this).attr("stroke", "black").attr("stroke-width", 3);
                }
            });
        })
}

const requestForEngProgrammeText= async()=>{
    const path = `data/20${window.year}/fin_provision/fin_provision_eng_20${window.year}.csv`
    const data = await d3.csv(path, d=>{
        return {
            "Head": +d["Head"],
            "Programme": +d["Programme No."],
            "Programme Name": d["Programme Name"],
            "Sector": d["Sector"],
        }
    })
    return data
}

const filterByHeadAndProgramme=(data, h, p)=>{
    return data.filter(item=>{
        return item['Head'] === h
    }).filter(item=>{
        return item['Programme'] == p
    })[0]
}

export default addInteraction