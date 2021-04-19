import { info } from "@youwol/dataframe"
import { decodeGocadTS } from "../lib"

const bufferTS1 =
`GOCAD TSurf 1
HEADER {
  name: test
}
PROPERTIES a
TFACE
PVRTX 0 0 0 0 1
PVRTX 1 1 0 0 4
PVRTX 2 0 1 0 9
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
    expect(true).toBeTruthy()

    const tss = decodeGocadTS(bufferTS1)
    expect(tss.length).toEqual(1)

    const ts = tss[0]
    console.log( info(ts) )

    expect(ts.get('positions')).toBeDefined()
    expect(ts.get('positions').count).toEqual(3)
    expect(ts.get('indices').count).toEqual(1)
    expect(ts.get('a').count).toEqual(3)
    
    {
        const sa = [1,4,9]
        const a = ts.get('a')
        a.forEachItem( (v,i) => expect(v).toEqual(sa[i]) )
    }

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

test('test 2 decode Gocad TS', () => {
    expect(true).toBeTruthy()

    const tss = decodeGocadTS(bufferTS2)
    expect(tss.length).toEqual(1)

    const ts = tss[0]
    console.log( info(ts) )

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
