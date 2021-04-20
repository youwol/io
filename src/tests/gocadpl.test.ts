import { info } from "@youwol/dataframe"
import { decodeGocadPL } from "../lib"

const bufferPL =
`GOCAD Pline 1
HEADER {
  name: test
}
PROPERTIES a
TFACE
PVRTX 0 0 0 0 1
PVRTX 1 1 0 0 4
PVRTX 2 0 1 0 9
SEG 0 1
SEG 1 2
END`

test('test decode Gocad TS', () => {
    const tss = decodeGocadPL(bufferPL)
    expect(tss.length).toEqual(1)

    const ts = tss[0]
    //console.log( info(ts) )

    expect(ts.get('positions')).toBeDefined()
    expect(ts.get('positions').count).toEqual(3)
    expect(ts.get('indices').count).toEqual(2)
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
        const sa = [[0,1], [1,2]]
        const a = ts.get('indices')
        a.forEachItem( (v,i) => expect(v).toEqual(sa[i]) )
    }
})
