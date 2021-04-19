import { info } from "@youwol/dataframe"
import { decodeGocadSO } from "../lib"

const bufferSO =
`GOCAD TVol 1
HEADER {
  name: test
}
PROPERTIES a
TFACE
PVRTX 0 0 0 0 1
PVRTX 1 1 0 0 4
PVRTX 2 0 1 0 9
PVRTX 3 0 1 -1 16
TETRA 0 1 2 3
END`

test('test decode Gocad TS', () => {
    expect(true).toBeTruthy()

    const tss = decodeGocadSO(bufferSO)
    expect(tss.length).toEqual(1)

    const ts = tss[0]
    console.log( info(ts) )

    expect(ts.get('positions')).toBeDefined()
    expect(ts.get('positions').count).toEqual(4)
    expect(ts.get('indices').count).toEqual(1)
    expect(ts.get('a').count).toEqual(4)
    
    {
        const sa = [1,4,9,16]
        const a = ts.get('a')
        a.forEachItem( (v,i) => expect(v).toEqual(sa[i]) )
    }

    {
        const sa = [[0,0,0], [1,0,0], [0,1,0], [0,1,-1]]
        const a = ts.get('positions')
        a.forEachItem( (v,i) => expect(v).toEqual(sa[i]) )
    }
    {
        const sa = [[0,1,2,3]]
        const a = ts.get('indices')
        a.forEachItem( (v,i) => expect(v).toEqual(sa[i]) )
    }
})
