import { decodeXYZ, encodeXYZ } from '../lib'

const buffer1 = `
# comment 1 with empty line before and after

# comment 2
# x y z a
# comment 3

0 0 0 1
1 0 0 4
0 1 0 9
`

test('decode simple xyz', () => {
    const tss = decodeXYZ(buffer1)
    expect(tss).toHaveLength(1)

    const ts = tss[0]
    //console.log( info(ts) )

    expect(ts.series.positions).toBeDefined()
    expect(ts.series.positions.count).toBe(3)
    expect(ts.series.indices).toBeUndefined()
    expect(ts.series.a.count).toBe(3)

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

const buffer2 = `
# CLASS Cube
# nx: 2
# ny: 2
# nz: 1
# x y z a
0 0 0 1
1 0 0 4
0 1 0 9
0 1 1 16
`

test('decode xyz implicite', () => {
    const tss = decodeXYZ(buffer2)
    expect(tss).toHaveLength(1)

    const ts = tss[0]
    //console.log( info(ts) )

    expect(ts.series.positions).toBeDefined()
    expect(ts.series.positions.count).toBe(4)
    expect(ts.series.indices).toBeUndefined()
    expect(ts.series.a.count).toBe(4)

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
            [0, 1, 1],
        ]
        const a = ts.series.positions
        a.forEach((v, i) => expect(v).toEqual(sa[i]))
    }
})

const buffer3 = `
# comment 1 with empty line before and after

# comment 2
# x y z Ux Uy Uz Sxx Sxy Sxz Syy Szz Syz Exx Exy Exz Eyx Eyy Eyz Ezx Ezy Ezz
# comment 3

0 0 0  1  2  3  0 0 0 0 0 0  0 0 0 0 0 0 0 0 0
1 0 0  4  5  6  0 0 0 0 0 0  0 0 0 0 0 0 0 0 0
0 1 0  9 10 11  0 0 0 0 0 0  0 0 0 0 0 0 0 0 0
`

test('decode simple xyz with vector attr (collapse)', () => {
    const tss = decodeXYZ(buffer3)
    expect(tss).toHaveLength(1)

    const ts = tss[0]

    expect(ts.series.positions).toBeDefined()
    expect(ts.series.positions.count).toBe(3)
    expect(ts.series.indices).toBeUndefined()

    expect(ts.series.U).toBeDefined()
    expect(ts.series.U.count).toBe(3)
    expect(ts.series.U.itemSize).toBe(3)

    expect(ts.series.S).toBeDefined()
    expect(ts.series.S.count).toBe(3)
    expect(ts.series.S.itemSize).toBe(6)

    expect(ts.series.E).toBeDefined()
    expect(ts.series.E.count).toBe(3)
    expect(ts.series.E.itemSize).toBe(9)

    {
        const sa = [
            [1, 2, 3],
            [4, 5, 6],
            [9, 10, 11],
        ]
        const U = ts.series.U
        U.forEach((v, i) => expect(v).toEqual(sa[i]))
    }

    console.log(ts)
    console.log(encodeXYZ(ts))
})
