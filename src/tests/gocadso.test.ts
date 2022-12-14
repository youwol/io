import { info } from '@youwol/dataframe'
import { decodeGocadSO } from '../lib'

const bufferSO = `GOCAD TVol 1
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
    const tss = decodeGocadSO(bufferSO)
    expect(tss.length).toEqual(1)

    const ts = tss[0]
    //console.log( info(ts) )

    expect(ts.series.positions).toBeDefined()
    expect(ts.series.positions.count).toEqual(4)
    expect(ts.series.indices.count).toEqual(1)
    expect(ts.series.a.count).toEqual(4)

    {
        const sa = [1, 4, 9, 16]
        const a = ts.series.a
        a.forEach((v, i) => expect(v).toEqual(sa[i]))
    }

    {
        const sa = [
            [0, 0, 0],
            [1, 0, 0],
            [0, 1, 0],
            [0, 1, -1],
        ]
        const a = ts.series.positions
        a.forEach((v, i) => expect(v).toEqual(sa[i]))
    }
    {
        const sa = [[0, 1, 2, 3]]
        const a = ts.series.indices
        a.forEach((v, i) => expect(v).toEqual(sa[i]))
    }
})
