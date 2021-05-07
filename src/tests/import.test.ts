import * as fs from 'file-system'

import { decodeGocadTS }             from '../lib/gocad/decoder'
import { fittingPlane, triangulate } from '@youwol/geometry'
//import { info, DataFrame }           from '@youwol/dataframe'

test('fake test', () => {
    const data = fs.readFileSync('./src/tests/s1.gcd', 'utf8')
    const dfs = decodeGocadTS( data )
    
    dfs.forEach( d => {
        dfs.forEach( (d, i) => {
            console.log( "Surface", i+1 )
            console.log( "  - nb vertices:", d.get('positions').count )
            console.log( "  - nb faces   :", d.get('indices').count )
        })
    })

    const points = dfs[0].get('positions') // get the points coordinates only
    const plane  = fittingPlane(points)

    const surface = triangulate( points, plane.normal )
    console.log( surface.get('positions') )
    console.log( surface.get('indices') )
})

