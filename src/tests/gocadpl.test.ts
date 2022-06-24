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
    expect(tss.length).toEqual(1) // 1 line

    const ts = tss[0]
    console.log( ts )

    expect(ts.series.positions).toBeDefined()
    expect(ts.series.positions.count).toEqual(3)
    expect(ts.series.indices.count).toEqual(2)
    expect(ts.series.a.count).toEqual(3)
    
    {
        const sa = [1,4,9]
        const a = ts.series.a
        a.forEach( (v,i) => expect(v).toEqual(sa[i]) )
    }

    {
        const sa = [[0,0,0], [1,0,0], [0,1,0]]
        const a = ts.series.positions
        a.forEach( (v,i) => expect(v).toEqual(sa[i]) )
    }
    {
        const sa = [[0,1], [1,2]]
        const a = ts.series.indices
        a.forEach( (v,i) => expect(v).toEqual(sa[i]) )
    }
})

const bufferPL2 =
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
END
GOCAD Pline 1
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

test('test decode Gocad TS x2', () => {
    const tss = decodeGocadPL(bufferPL2)
    expect(tss.length).toEqual(2) // 2 different lines
})

const bufferPL3 =
`GOCAD PLine 1
HEADER {
name:dykes
}
ILINE
VRTX 0 699457 9.96663e+006 -500
VRTX 1 699594 9.96646e+006 -500
VRTX 2 699731 9.96628e+006 -500
VRTX 3 699869 9.96611e+006 -500
VRTX 4 700006 9.96593e+006 -500
SEG 0 1
SEG 1 2
SEG 2 3
SEG 3 4
ILINE
VRTX 5 697498 9.96389e+006 -500
VRTX 6 697461 9.96365e+006 -500
VRTX 7 697431 9.96341e+006 -500
VRTX 8 697412 9.96316e+006 -500
VRTX 9 697403 9.96292e+006 -500
VRTX 10 697434 9.96268e+006 -500
VRTX 11 697474 9.96244e+006 -500
SEG 5 6
SEG 6 7
SEG 7 8
SEG 8 9
SEG 9 10
SEG 10 11
ILINE
VRTX 12 701164 9.965e+006 -500
VRTX 13 701326 9.96483e+006 -500
VRTX 14 701489 9.96466e+006 -500
VRTX 15 701656 9.96449e+006 -500
VRTX 16 701834 9.96434e+006 -500
VRTX 17 701985 9.96416e+006 -500
VRTX 18 702117 9.96397e+006 -500
VRTX 19 702262 9.96378e+006 -500
VRTX 20 702420 9.96361e+006 -500
SEG 12 13
SEG 13 14
SEG 14 15
SEG 15 16
SEG 16 17
SEG 17 18
SEG 18 19
SEG 19 20
ILINE
VRTX 21 701421 9.96324e+006 -500
VRTX 22 701566 9.96307e+006 -500
VRTX 23 701687 9.96289e+006 -500
VRTX 24 701801 9.9627e+006 -500
SEG 21 22
SEG 22 23
SEG 23 24
END`

test('test decode Gocad TS components', () => {
    const tss = decodeGocadPL(bufferPL3)
    expect(tss.length).toEqual(4) // 4 different lines

    const nv = [5, 7, 9, 4]
    const ns = [4, 6, 8, 3]
    
    tss.forEach( (ts, i) => {
        expect(ts.series.positions).toBeDefined()
        expect(ts.series.positions.count).toEqual(nv[i])
        expect(ts.series.indices.count).toEqual(ns[i])
    })
    
})