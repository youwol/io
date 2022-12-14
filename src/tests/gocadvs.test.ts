import { info } from '@youwol/dataframe'
import { decodeGocadVS } from '../lib'

const bufferVS = `GOCAD VSet 1
HEADER {
  name: test
}
PROPERTIES a
TFACE
PVRTX 0 0 0 0 1
PVRTX 1 1 0 0 4
PVRTX 2 0 1 0 9
END`

test('test decode Gocad VS', () => {
    const tss = decodeGocadVS(bufferVS)
    expect(tss.length).toEqual(1)

    const ts = tss[0]
    //console.log( info(ts) )

    expect(ts.series.positions).toBeDefined()
    expect(ts.series.positions.count).toEqual(3)
    expect(ts.series.indices).toBeUndefined()
    expect(ts.series.a.count).toEqual(3)

    {
        const sa = [1, 4, 9]
        const a = ts.series.a
        a.forEach((v, i) => expect(v).toEqual(sa[i]))
    }

    {
        const sa = [
            [0, 0, 0],
            [1, 0, 0],
            [0, 1, 0],
        ]
        const a = ts.series.positions
        a.forEach((v, i) => expect(v).toEqual(sa[i]))
    }
})
