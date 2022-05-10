const loaders = require('../dist/@youwol/io')
const fs      = require('fs')

const filename = '../models/object.off'

const filter = loaders.IOFactory.getFilter(filename)
if (filter) {
    // console.log(filter)
    const text = fs.readFileSync(filename, 'utf8')
    const state = filter.decode(text)
    console.log(state[0].series.positions)
    console.log(state[0].series.indices)

    state[0].series.indices.forEach( v => console.log(v))
}
