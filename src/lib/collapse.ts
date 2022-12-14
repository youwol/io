import { concatenate } from './concatenate'

/**
 * Allow to collapse special attributes based on name suffixes
 * <ul>
 *   <li>vector3: (x,y,z)
 *   <li>smatrix3: (xx, xy, xz, yy, yz, zz)
 *   <li>matrix3: (xx, xy, xz, yx, yy, yz, zx, zy, zz)
 * </ul>
 * As an example, if names includes 'Ux', 'Uy' and 'Uz', then all the tree attributes
 * will be collapsed into one vector3 attribute (with itemSize=3) named 'U'
 * @example
 * ```ts
 * const attributes = [[5,6], [1,2], [3,4]]
 * const names = ['uz', 'ux', 'uy']
 * console.log( collapse(names, attributes) )
 * ```
 * will display
 * ```sh
 * {
 *   names: [ 'u' ],
 *   values: [ [ 1, 3, 5, 2, 4, 6 ] ],
 *   itemSizes: [ 3 ],
 *   orders: [ [ 'x', 'y', 'z' ] ]
 *}
 * ```
 * @param attrNames The attribute names (array)
 * @param attributes The attributes (flat arrays)
 * @returns flat arrays of collapsed attributes
 *
 * @category Utils
 */
export function collapse(attrNames: string[], attributeArrays: number[][]) {
    // Detect potential attributes with itemSize>1
    const contract = (
        fullName: string,
        names: string[],
        attributes: number[][],
        suffixes: string[],
    ): number[][] => {
        const suf = fullName.substring(fullName.length - suffixes[0].length)
        if (suffixes.includes(suf)) {
            const baseName = fullName.substring(
                0,
                fullName.length - suffixes[0].length,
            )
            if (
                suffixes.reduce(
                    (ok, s) =>
                        ok &&
                        names.find((e) => e === baseName + s) !== undefined,
                    true,
                )
            ) {
                const ids = suffixes.map((s) => names.indexOf(baseName + s))
                const attrs = []
                ids.forEach((id) => attrs.push(attributes[id]))
                // remove the names
                // remove the attributes
                suffixes.forEach((s) => {
                    const id = names.indexOf(baseName + s)
                    names.splice(id, 1)
                    attributes.splice(id, 1)
                }) // map -> forEach
                return attrs
            }
        }
        return undefined
    }

    // const concatenate = (mat: number[][], itemSize: number) => {
    //     const m = mat.length
    //     const n = mat[0].length
    //     const a = new Array(n*itemSize).fill(0)
    //     let k = 0
    //     for (let j=0; j<n; ++j) {
    //         for (let i=0; i<m; ++i) a[k++] = mat[i][j]
    //     }
    //     return a
    // }

    const perform = (name: string, orders: string[]) => {
        //const size = orders.length
        const mat = contract(name, names, attributes, orders)
        if (mat) {
            allAttributes.push(concatenate(mat))
            allNames.push(name.substring(0, name.length - orders[0].length))
            allItemSizes.push(orders.length)
            allOrders.push(orders)
            return true
        }
        return false
    }

    const names: string[] = [...attrNames]
    const attributes: number[][] = [...attributeArrays]
    const allAttributes: number[][] = []
    const allNames: string[] = []
    const allItemSizes: number[] = []
    const allOrders: string[][] = []

    const tensors = [
        ['xx', 'xy', 'xz', 'yx', 'yy', 'yz', 'zx', 'zy', 'zz'],
        ['xx', 'xy', 'xz', 'yy', 'yz', 'zz'],
        ['x', 'y', 'z'],
    ]

    while (names.length !== 0) {
        const name = names[0]
        if (
            !(() => {
                for (let i = 0; i < tensors.length; ++i) {
                    if (perform(name, tensors[i])) return true
                }
                return false
            })()
        ) {
            //console.log(name, attrNames, attrNames.indexOf(name), attributes)
            allAttributes.push([...attributes[names.indexOf(name)]])
            allNames.push(name)
            allItemSizes.push(1)
            allOrders.push([name])
            names.shift()
            attributes.shift()
        }
    }

    return allNames.map((_, i) => {
        return {
            name: allNames[i],
            value: allAttributes[i],
            itemSize: allItemSizes[i],
            order: allOrders[i],
        }
    })
}
