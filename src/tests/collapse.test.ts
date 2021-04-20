import { collapse } from "../lib/collapse"

test('test collapse scalar', () => {
    const attributes = [[1,2,3],[4,5,6]]
    const names = ['a','b']
    const sol = collapse(names, attributes)
    expect(sol.names[0]).toEqual('a')
    expect(sol.names[1]).toEqual('b')
    expect(sol.itemSizes[0]).toEqual(1)
    expect(sol.itemSizes[1]).toEqual(1)
    expect(sol.values[0]).toEqual([1, 2, 3])
    expect(sol.values[1]).toEqual([4, 5, 6])
})

test('test collapse vector3', () => {
    const attributes = [[1,2], [3,4], [5,6]]
    const names = ['ux', 'uy', 'uz']
    const sol = collapse(names, attributes)
    expect(sol.names.length).toEqual(1)
    expect(sol.names[0]).toEqual('u')
    expect(sol.itemSizes[0]).toEqual(3)
    expect(sol.values[0]).toEqual([1,3,5, 2,4,6])
    expect(sol.orders[0]).toEqual(['x','y','z'])
})

test('test collapse vector3 desorder', () => {
    const attributes = [[5,6], [1,2], [3,4]]
    const names = ['uz', 'ux', 'uy']
    const sol = collapse(names, attributes)
    expect(sol.names.length).toEqual(1)
    expect(sol.names[0]).toEqual('u')
    expect(sol.itemSizes[0]).toEqual(3)
    expect(sol.values[0]).toEqual([1,3,5, 2,4,6])
    expect(sol.orders[0]).toEqual(['x','y','z'])
})

test('test collapse smatrix', () => {
    const attributes = [[1,2], [3,4], [5,6], [7,8], [9,1], [2,3]]
    const names = ['Sxx', 'Sxy', 'Sxz', 'Syy', 'Syz', 'Szz']
    const sol = collapse(names, attributes)
    expect(sol.names.length).toEqual(1)
    expect(sol.names[0]).toEqual('S')
    expect(sol.itemSizes[0]).toEqual(6)
    expect(sol.values[0]).toEqual([1,3,5,7,9,2, 2,4,6,8,1,3])
    expect(sol.orders[0]).toEqual(['xx','xy','xz','yy','yz','zz'])
})

test('test collapse smatrix desorder', () => {
    const attributes = [[5,6], [3,4], [1,2], [7,8], [9,1], [2,3]]
    const names = ['Sxz', 'Sxy', 'Sxx', 'Syy', 'Syz', 'Szz']
    const sol = collapse(names, attributes)
    expect(sol.names.length).toEqual(1)
    expect(sol.names[0]).toEqual('S')
    expect(sol.itemSizes[0]).toEqual(6)
    expect(sol.values[0]).toEqual([1,3,5,7,9,2, 2,4,6,8,1,3])
    expect(sol.orders[0]).toEqual(['xx','xy','xz','yy','yz','zz'])
})

test('test collapse matrix', () => {
    const attributes = [[1,2], [3,4], [5,6], [7,8], [9,1], [2,3], [4,5], [6,7], [8,9]]
    const names = ['Sxx', 'Sxy', 'Sxz', 'Syx', 'Syy', 'Syz', 'Szx', 'Szy', 'Szz']
    const sol = collapse(names, attributes)
    expect(sol.names.length).toEqual(1)
    expect(sol.names[0]).toEqual('S')
    expect(sol.itemSizes[0]).toEqual(9)
    expect(sol.values[0]).toEqual([1,3,5,7,9,2,4,6,8, 2,4,6,8,1,3,5,7,9])
    expect(sol.orders[0]).toEqual(['xx','xy','xz','yx','yy','yz','zx','zy','zz'])
})