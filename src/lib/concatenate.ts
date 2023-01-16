/**
 * Concatenate an array of attributes with itemSize=1 into one with itemSize=number of attributes
 * @category Utils
 */
export const concatenate = (mat: number[][]) => {
    const itemSize = mat.length
    const n = mat[0].length
    const a = new Array(n * itemSize).fill(0)
    let k = 0
    for (let j = 0; j < n; ++j) {
        for (let i = 0; i < itemSize; ++i) {
            a[k++] = mat[i][j]
        }
    }
    return a
}
