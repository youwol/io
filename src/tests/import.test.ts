import { readFileSync } from 'fs'

import { decodeGocadTS } from '../lib/gocad/decoder'
import { fittingPlane, triangulate } from '@youwol/geometry'
//import { info, DataFrame }           from '@youwol/dataframe'

test('import test', () => {
    const data = readFileSync('./src/tests/s1.gcd', 'utf8')
    const dfs = decodeGocadTS(data)

    dfs.forEach((d, i) => {
        console.log('Surface', i + 1)
        console.log('  - nb vertices:', d.series.positions.count)
        console.log('  - nb faces   :', d.series.indices.count)
    })

    const points = dfs[0].series.positions // get the points coordinates only
    const plane = fittingPlane(points)

    expect(plane).toBeDefined()
    expect(plane.normal).toBeDefined()

    const surface = triangulate(points, plane.normal)
    expect(surface.series).toBeDefined()
    expect(surface.series.positions).toBeDefined()
    expect(surface.series.indices).toBeDefined()

    console.log(surface.series.positions)
    console.log(surface.series.indices)
})
