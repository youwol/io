const loaders = require('../dist/@youwol/io')
const fs      = require('fs')

const filename = '../models/object-bin.stl'

const filter = loaders.IOFactory.getFilter(filename)
if (filter) {
    console.log(filter)
    const text = fs.readFileSync(filename, undefined)
    const state = filter.decode(text.buffer)
    console.log(state)
}
