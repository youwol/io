const io   = require('../dist/@youwol/io')
const df   = require('../../dataframe/dist/@youwol/dataframe')
const geom = require('../../geometry/dist/@youwol/geometry')
const fs   = require('fs')

const data = fs.readFileSync('./s1.gcd', 'utf8')
const dfs = io.decodeGocadTS( data )

// Display some info about the loaded surface(s)
dfs.forEach( d => {
    dfs.forEach( (d, i) => {
        console.log( "Surface", i+1 )
        console.log( "  - nb vertices:", d.get('positions').count )
        console.log( "  - nb faces   :", d.get('indices').count )
    })
})

const points = dfs[0].get('positions') // get the points coordinates only
const plane  = geom.fittingPlane(points)

const surface = geom.triangulate( points, plane.normal )
console.log(surface)
// {
//     console.log( "  - nb vertices:", surface.get('positions').count )
//     console.log( "  - nb faces   :", surface.get('indices').count )
// }