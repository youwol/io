import { collapse } from "../lib/collapse"

test('test collapse scalar', () => {
    const attributes = [[1,2,3],[4,5,6]]
    const names = ['a','b']
    const sol = collapse(names, attributes)

    expect(sol[0].name).toEqual('a')
    expect(sol[1].name).toEqual('b')
    expect(sol[0].itemSize).toEqual(1)
    expect(sol[1].itemSize).toEqual(1)
    expect(sol[0].value).toEqual([1, 2, 3])
    expect(sol[1].value).toEqual([4, 5, 6])
})

test('test collapse vector3', () => {
    const attributes = [[1,2], [3,4], [5,6]]
    const names = ['ux', 'uy', 'uz']
    const sol = collapse(names, attributes)
    expect(sol.length).toEqual(1)
    expect(sol[0].name).toEqual('u')
    expect(sol[0].itemSize).toEqual(3)
    expect(sol[0].value).toEqual([1,3,5, 2,4,6])
    expect(sol[0].order).toEqual(['x','y','z'])
})

test('test collapse vector3 desorder', () => {
    const attributes = [[5,6], [1,2], [3,4]]
    const names = ['uz', 'ux', 'uy']
    const sol = collapse(names, attributes)
    expect(sol.length).toEqual(1)
    expect(sol[0].name).toEqual('u')
    expect(sol[0].itemSize).toEqual(3)
    expect(sol[0].value).toEqual([1,3,5, 2,4,6])
    expect(sol[0].order).toEqual(['x','y','z'])
})

test('test collapse scalar & vector3', () => {
    const attributes = [[99,100], [1,2], [3,4], [5,6]]
    const names = ['a', 'Ux', 'Uy', 'Uz']
    const sol = collapse(names, attributes)

    expect(sol.length).toEqual(2)

    expect(sol[0].name).toEqual('a')
    expect(sol[0].itemSize).toEqual(1)
    expect(sol[0].value).toEqual([99,100])

    expect(sol[1].name).toEqual('U')
    expect(sol[1].itemSize).toEqual(3)
    expect(sol[1].value).toEqual([1,3,5, 2,4,6])
    expect(sol[1].order).toEqual(['x','y','z'])
})

test('test collapse smatrix', () => {
    const attributes = [[1,2], [3,4], [5,6], [7,8], [9,1], [2,3]]
    const names = ['Sxx', 'Sxy', 'Sxz', 'Syy', 'Syz', 'Szz']
    const sol = collapse(names, attributes)
    expect(sol.length).toEqual(1)
    expect(sol[0].name).toEqual('S')
    expect(sol[0].itemSize).toEqual(6)
    expect(sol[0].value).toEqual([1,3,5,7,9,2, 2,4,6,8,1,3])
    expect(sol[0].order).toEqual(['xx','xy','xz','yy','yz','zz'])
})

test('test collapse smatrix desorder', () => {
    const attributes = [[5,6], [3,4], [1,2], [7,8], [9,1], [2,3]]
    const names = ['Sxz', 'Sxy', 'Sxx', 'Syy', 'Syz', 'Szz']
    const sol = collapse(names, attributes)
    expect(sol.length).toEqual(1)
    expect(sol[0].name).toEqual('S')
    expect(sol[0].itemSize).toEqual(6)
    expect(sol[0].value).toEqual([1,3,5,7,9,2, 2,4,6,8,1,3])
    expect(sol[0].order).toEqual(['xx','xy','xz','yy','yz','zz'])
})

test('test collapse matrix', () => {
    const attributes = [[1,2], [3,4], [5,6], [7,8], [9,1], [2,3], [4,5], [6,7], [8,9]]
    const names = ['Sxx', 'Sxy', 'Sxz', 'Syx', 'Syy', 'Syz', 'Szx', 'Szy', 'Szz']
    const sol = collapse(names, attributes)
    expect(sol.length).toEqual(1)
    expect(sol[0].name).toEqual('S')
    expect(sol[0].itemSize).toEqual(9)
    expect(sol[0].value).toEqual([1,3,5,7,9,2,4,6,8, 2,4,6,8,1,3,5,7,9])
    expect(sol[0].order).toEqual(['xx','xy','xz','yx','yy','yz','zx','zy','zz'])
})

test('test collapse bad smatrix', () => {
    const attributes = [[1,2], [3,4], [5,6], [7,8], [9,1], [2,3]]
    const names = ['Sxy', 'Sxy', 'Sxz', 'Syy', 'Syz', 'Szz']
    const sol = collapse(names, attributes)
    expect(sol.length).toEqual(6)
    const S = ['Sxy', 'Sxy', 'Sxz', 'Syy', 'Syz', 'Szz']
    sol.forEach( (s,i) => expect(s.name).toEqual(S[i]) )
})

test('test collapse many smatrix', () => {
    const attributes = [[1,2], [3,4], [5,6], [7,8], [9,1], [2,3],   [1,2], [3,4], [5,6], [8,9]]
    const names = ['Sxx', 'Syy', 'Szz', 'Sxy', 'Sxz', 'Syz', 'dy', 'dz', 'dx', 'b']

    const sol = collapse(names, attributes)
    expect(sol.length).toEqual(3)

    expect(sol[0].name).toEqual('S')
    expect(sol[1].name).toEqual('d')
    expect(sol[2].name).toEqual('b')

    expect(sol[0].itemSize).toEqual(6)
    expect(sol[1].itemSize).toEqual(3)
    expect(sol[2].itemSize).toEqual(1)

    expect(sol[0].value).toEqual([1, 7, 9, 3, 2, 5, 2, 8, 1, 4, 3, 6])
    expect(sol[1].value).toEqual([5, 1, 3, 6, 2, 4])
    expect(sol[2].value).toEqual([8, 9])

    expect(sol[0].order).toEqual(['xx','xy','xz','yy','yz','zz'])
    expect(sol[1].order).toEqual(['x','y','z'])
    expect(sol[2].order).toEqual(['b'])
})