const d3 = require('d3')

const process = ()=>{
    d3.csv('./fin_provision_chi.csv', (data)=>{
        console.log(data)
        return data
    })
}

module.exports = process