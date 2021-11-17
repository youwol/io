import { decodeGocadTS, merge } from "../lib"

const bufferTS1 =
`GOCAD TSurf 1
HEADER {
  name: test

}      
TFACE
VRTX 0 0 0 0
VRTX 1 1 0 0
VRTX 2 0 1 0
TRGL 0 1 2
END`

const bufferTS2 =
`GOCAD TSurf 1
HEADER {
  name: test
}
VRTX 0 3 0 1
VRTX 1 4 0 1
VRTX 2 3 1 1
TRGL 0 1 2
END`

test('test merge Gocad TS', () => {
    const t1 = decodeGocadTS(bufferTS1)[0]
    const t2 = decodeGocadTS(bufferTS2)[0]

    const sol = merge([t1.series.positions, t2.series.positions], [t1.series.indices, t2.series.indices])
    console.log(sol)

    expect(sol.positions.count).toEqual(6)
    expect(sol.indices.count).toEqual(2)

    const V = [
        0, 0, 0,
        1, 0, 0,
        0, 1, 0,
        3, 0, 1,
        4, 0, 1,
        3, 1, 1
    ]
    sol.positions.array.forEach( (v,i) => expect(v).toEqual(V[i]) )

    const T = [
        0, 1, 2,
        3, 4, 5
    ]
    sol.indices.array.forEach( (t,i) => expect(t).toEqual(T[i]) )
})
