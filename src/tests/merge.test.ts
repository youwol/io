import { minMax } from "@youwol/math"
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

    const sol = merge([t1, t2])

    expect(sol.series.positions.count).toEqual(6)
    expect(sol.series.indices.count).toEqual(2)

    const V = [
        0, 0, 0,
        1, 0, 0,
        0, 1, 0,
        3, 0, 1,
        4, 0, 1,
        3, 1, 1
    ]
    sol.series.positions.array.forEach( (v,i) => expect(v).toEqual(V[i]) )

    const T = [
        0, 1, 2,
        3, 4, 5
    ]
    sol.series.indices.array.forEach( (t,i) => expect(t).toEqual(T[i]) )
})


const bufferTS11 =
`GOCAD TSurf 1
HEADER {
  name: test

}      
TFACE
PROPERTIES a
PVRTX 0 0 0 0 1
PVRTX 1 1 0 0 2
PVRTX 2 0 1 0 3
TRGL 0 1 2
END`

const bufferTS12 =
`GOCAD TSurf 1
HEADER {
  name: test
}
PROPERTIES a
PVRTX 0 3 0 1 6
PVRTX 1 4 0 1 7
PVRTX 2 3 1 1 8
TRGL 0 1 2
END`

test('test merge Gocad TS with prop', () => {
    const t1 = decodeGocadTS(bufferTS11)[0]
    const t2 = decodeGocadTS(bufferTS12)[0]

    const sol = merge([t1, t2])

    expect(sol.series.positions.count).toEqual(6)
    expect(sol.series.indices.count).toEqual(2)
    expect(sol.series.a).toBeDefined()
    expect(sol.series.a.itemSize).toEqual(1)
    expect(sol.series.a.count).toEqual(6)
})

test('test merge Gocad TS with prop min/max', () => {
  const t1 = decodeGocadTS(bufferTS11)
  const t2 = decodeGocadTS(bufferTS12)

  const sol = merge([...t1, ...t2])

  const m = minMax(sol.series.a)
  expect(m[0]).toEqual(1)
  expect(m[1]).toEqual(8)
})



const bufferTS21 =
`GOCAD TSurf 1
HEADER {
  name: test

}      
TFACE
PROPERTIES a
PVRTX 0 0 0 0 1
PVRTX 1 1 0 0 2
PVRTX 2 0 1 0 3
TRGL 0 1 2
END`

const bufferTS22 =
`GOCAD TSurf 1
HEADER {
  name: test
}
PROPERTIES b
PVRTX 0 3 0 1 6
PVRTX 1 4 0 1 7
PVRTX 2 3 1 1 8
TRGL 0 1 2
END`

test('test merge Gocad TS with different prop names', () => {
    const t1 = decodeGocadTS(bufferTS21)[0]
    const t2 = decodeGocadTS(bufferTS22)[0]

    const sol = merge([t1, t2])

    expect(sol.series.positions.count).toEqual(6)
    expect(sol.series.indices.count).toEqual(2)
    expect(sol.series.a).toBeUndefined()
    expect(sol.series.b).toBeUndefined()
})


const bufferTS31 =
`GOCAD TSurf 1
HEADER {
  name: test

}      
TFACE
PROPERTIES a
ESIZES 1
PVRTX 0 0 0 0 1
PVRTX 1 1 0 0 2
PVRTX 2 0 1 0 3
TRGL 0 1 2
END`

const bufferTS32 =
`GOCAD TSurf 1
HEADER {
  name: test
}
PROPERTIES a
ESIZES 3
PVRTX 0 3 0 1 6 1 2
PVRTX 1 4 0 1 7 1 2
PVRTX 2 3 1 1 8 1 2
TRGL 0 1 2
END`

test('test merge Gocad TS with same prop names but different itemSize', () => {
    const t1 = decodeGocadTS(bufferTS31)[0]
    const t2 = decodeGocadTS(bufferTS32)[0]

    const sol = merge([t1, t2])

    expect(sol.series.positions.count).toEqual(6)
    expect(sol.series.indices.count).toEqual(2)
    expect(sol.series.a).toBeUndefined()
    expect(sol.series.b).toBeUndefined()
})




const bufferTS41 =
`GOCAD TSurf 1
HEADER {
  name: test

}      
TFACE
PROPERTIES a
PVRTX 0 0 0 0 1
PVRTX 1 1 0 0 2
PVRTX 2 0 1 0 3
PVRTX 3 1 1 0 3
TRGL 0 1 2
TRGL 0 2 3
END`

const bufferTS42 =
`GOCAD TSurf 1
HEADER {
  name: test
}
PROPERTIES a
PVRTX 0 3 0 1 6
PVRTX 1 4 0 1 7
PVRTX 2 3 1 1 8
PVRTX 3 1 1 0 3
TRGL 0 1 2
TRGL 0 2 3
END`

test('test merge Gocad TS with prop', () => {
    const t1 = decodeGocadTS(bufferTS41)[0]
    const t2 = decodeGocadTS(bufferTS42)[0]

    const sol = merge([t1, t2])

    expect(sol.series.positions.count).toEqual(8)
    expect(sol.series.indices.count).toEqual(4)
    expect(sol.series.a).toBeDefined()
    expect(sol.series.a.itemSize).toEqual(1)
    expect(sol.series.a.count).toEqual(8)

    console.log(sol.series.positions)
    console.log(sol.series.indices)
    console.log(sol.series.a)
})