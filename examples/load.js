const io   = require('../dist/@youwol/io')
const df   = require('@youwol/dataframe')
const geom = require('@youwol/geometry')
const fs   = require('fs')

//const data = fs.readFileSync('./s1.gcd', 'utf8')
const data = fs.readFileSync('/Users/fmaerten/test/models/arch/santos/grid_flat.ts', 'utf8')
const dfs = io.decodeGocadTS( data )

// Display some info about the loaded surface(s)
dfs.forEach( d => {
    dfs.forEach( (d, i) => {
        console.log( "Surface", i+1 )
        console.log( "  - nb vertices:", d.series['positions'].count )
        console.log( "  - nb faces   :", d.series['indices'].count )
    })
})

const points = dfs[0].series['positions'] // get the points coordinates only
const plane  = geom.fittingPlane(points)

const surface = geom.triangulate( points, plane.normal )
console.log( df.info(surface) )
