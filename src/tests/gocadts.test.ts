import { decodeGocadTS } from "../lib"
import { info, minMaxArray } from "@youwol/dataframe"
import { dataGala } from './GalapagosObs'
import { dataS1 } from './S1'

const bufferTS1 =
`GOCAD TSurf 1
HEADER {
  name: test

}
# coucou

      
PROPERTIES a Ux Uy Uz

TFACE
PVRTX 0 0 0 0 1 0 0 0
PVRTX 1 1 0 0 4 1 1 1
PVRTX 2 0 1 0 9 2 2 2
TRGL 0 1 2
END


GOCAD TSurf 1
HEADER {
  name: test
}
PROPERTIES a Ux Uy Uz
TFACE
PVRTX 0 0 0 0 1 0 0 0
PVRTX 1 1 0 0 4 1 1 1
PVRTX 2 0 1 0 9 2 2 2
TRGL 0 1 2
END`

const bufferTS2 =
`GOCAD TSurf 1
HEADER {
  name: test
}
VRTX 0 0 0 0
VRTX 1 1 0 0
VRTX 2 0 1 0 
TRGL 0 1 2
END`

test('test 1 decode Gocad TS', () => {
    const tss = decodeGocadTS(bufferTS1)
    expect(tss.length).toEqual(2)

    const ts = tss[0]
    //console.log( info(ts) )

    expect(ts.get('positions')).toBeDefined()
    expect(ts.get('positions').count).toEqual(3)
    expect(ts.get('indices').count).toEqual(1)

    expect(ts.get('a')).toBeDefined()
    expect(ts.get('a').count).toEqual(3)
    expect(ts.get('a').itemSize).toEqual(1)

    expect(ts.get('U')).toBeDefined()
    expect(ts.get('U').count).toEqual(3)
    expect(ts.get('U').itemSize).toEqual(3)
    
    {
        const sa = [[0,0,0], [1,0,0], [0,1,0]]
        const a = ts.get('positions')
        a.forEachItem( (v,i) => expect(v).toEqual(sa[i]) )
    }
    {
        const sa = [[0,1,2]]
        const a = ts.get('indices')
        a.forEachItem( (v,i) => expect(v).toEqual(sa[i]) )
    }

    {
        const sa = [1,4,9]
        const a = ts.get('a')
        a.forEachItem( (v,i) => expect(v).toEqual(sa[i]) )
    }

    {
        const sU = [[0,0,0], [1,1,1], [2,2,2]]
        const U = ts.get('U')
        U.forEachItem( (v,i) => expect(v).toEqual(sU[i]) )
    }
})

test('test 1 decode Gocad TS NOT merging', () => {
    const tss = decodeGocadTS(bufferTS1, {merge: false})
    expect(tss.length).toEqual(2)

    const ts = tss[0]
    //console.log( info(ts) )

    expect(ts.get('positions')).toBeDefined()
    expect(ts.get('positions').count).toEqual(3)
    expect(ts.get('indices').count).toEqual(1)

    expect(ts.get('a')).toBeDefined()
    expect(ts.get('a').count).toEqual(3)
    expect(ts.get('a').itemSize).toEqual(1)

    expect(ts.get('Ux')).toBeDefined()
    expect(ts.get('Ux').count).toEqual(3)
    expect(ts.get('Ux').itemSize).toEqual(1)
    
    {
        const sa = [[0,0,0], [1,0,0], [0,1,0]]
        const a = ts.get('positions')
        a.forEachItem( (v,i) => expect(v).toEqual(sa[i]) )
    }
    {
        const sa = [[0,1,2]]
        const a = ts.get('indices')
        a.forEachItem( (v,i) => expect(v).toEqual(sa[i]) )
    }
    {
        const sa = [1,4,9]
        const a = ts.get('a')
        a.forEachItem( (v,i) => expect(v).toEqual(sa[i]) )
    }
    {
        const sa = [0,1,2]
        const a = ts.get('Ux')
        a.forEachItem( (v,i) => expect(v).toEqual(sa[i]) )
    }
    {
        const sa = [0,1,2]
        const a = ts.get('Uy')
        a.forEachItem( (v,i) => expect(v).toEqual(sa[i]) )
    }
    {
        const sa = [0,1,2]
        const a = ts.get('Uz')
        a.forEachItem( (v,i) => expect(v).toEqual(sa[i]) )
    }
    
})

test('test 2 decode Gocad TS', () => {
    const tss = decodeGocadTS(bufferTS2)
    expect(tss.length).toEqual(1)

    const ts = tss[0]

    expect(ts.get('positions')).toBeDefined()
    expect(ts.get('positions').count).toEqual(3)
    expect(ts.get('indices').count).toEqual(1)
    expect(ts.get('a')).toBeUndefined()
    
    {
        const sa = [[0,0,0], [1,0,0], [0,1,0]]
        const a = ts.get('positions')
        a.forEachItem( (v,i) => expect(v).toEqual(sa[i]) )
    }
    {
        const sa = [[0,1,2]]
        const a = ts.get('indices')
        a.forEachItem( (v,i) => expect(v).toEqual(sa[i]) )
    }
})

test('test decode Gocad Galapagos with many stresses and displs', () => {
    const dfs = decodeGocadTS(dataGala)

    expect(dfs.length).toEqual(2) // 2 objects

    const df = dfs[0]

    const attrs = ['positions','indices',
        'U1','U2','U3','U4','U5','U6','U7','U8','U8','U10','U11','U12',
        'S1','S2','S3','S4','S5','S6','S7','S8','S8','S10','S11','S12']
    // 5811 nodes
    df.series.forEach( (info, name) => {
        if (name.startsWith('pos')) {
            expect(attrs.indexOf(name)).toBeDefined()
            expect(info.serie.itemSize).toEqual(3)
            expect(info.serie.count).toEqual(6) // points
        }
        if (name.startsWith('ind')) {
            expect(attrs.indexOf(name)).toBeDefined()
            expect(info.serie.itemSize).toEqual(3)
            expect(info.serie.count).toEqual(2) // triangles
        }
        if (name.startsWith('U')) {
            expect(attrs.indexOf(name)).toBeDefined()
            expect(info.serie.itemSize).toEqual(3)
            expect(info.serie.count).toEqual(6)
        }
        if (name.startsWith('S')) {
            expect(attrs.indexOf(name)).toBeDefined()
            expect(info.serie.itemSize).toEqual(6)
            expect(info.serie.count).toEqual(6)
        }
    })
})

// 246 nodes
// 438 triangles
// This file includes spaces and tabulations
test('test decode Gocad with tabulations, spaces, empty lines and comments', () => {
    const dfs = decodeGocadTS(dataS1)
    expect(dfs.length).toEqual(1)

    const df = dfs[0]
    
    const attrs = ['positions','indices', 'C', 'F', 'V', 'Z']
    const names = ['C', 'F', 'V', 'Z']
    const visited = new Map<string, boolean>([
        ['C', false],
        ['F', false],
        ['V', false],
        ['Z', false]]
    )

    df.series.forEach( (info, name) => {
        if (name.startsWith('pos')) {
            expect(attrs.indexOf(name)).toBeDefined()
            expect(info.serie.itemSize).toEqual(3)
            expect(info.serie.count).toEqual(246) // points
        }
        else if (name.startsWith('ind')) {
            expect(attrs.indexOf(name)).toBeDefined()
            expect(info.serie.itemSize).toEqual(3)
            expect(info.serie.count).toEqual(438) // triangles
        }

        else {
            expect(attrs.indexOf(name)).toBeDefined()
            expect(info.serie.itemSize).toEqual(1)
            expect(info.serie.count).toEqual(246)
            visited.set(name, true)
        }
    })

    expect(visited.size).toEqual(4)
    visited.forEach( (v,k) => {
        expect(v).toBeTruthy()
        expect(names.includes(k)).toBeTruthy()
    })
})
