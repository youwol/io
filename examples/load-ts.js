// const df   = require('@youwol/dataframe')
// const geom = require('@youwol/geometry')
const loaders = require('../dist/@youwol/io')
const fs      = require('fs')

const filename = '../models/object.gcd'

const filter = loaders.IOFactory.getFilter(filename)
if (filter) {
    console.log(filter)
    const text = fs.readFileSync(filename, 'utf8')
    const state = filter.decode(text)
    console.log(state)
}







// const data = fs.readFileSync('./s1.gcd', 'utf8')
// const dfs = io.decodeGocadTS( data )

// // Display some info about the loaded surface(s)
// dfs.forEach( d => {
//     dfs.forEach( (d, i) => {
//         console.log( "Surface", i+1 )
//         console.log( "  - nb vertices:", d.series['positions'].count )
//         console.log( "  - nb faces   :", d.series['indices'].count )
//     })
// })

// const points = dfs[0].series['positions'] // get the points coordinates only
// const plane  = geom.fittingPlane(points)

// const surface = geom.triangulate( points, plane.normal )
// console.log( df.info(surface) )
