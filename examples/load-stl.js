const loaders = require('../dist/@youwol/io')
const fs      = require('fs')

const filename = '../models/object.stl'

const filter = loaders.IOFactory.getFilter(filename)
if (filter) {
    console.log(filter)
    const text = fs.readFileSync(filename, 'utf8')
    const state = filter.decode(text)
    console.log(state)
}
