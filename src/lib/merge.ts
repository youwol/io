import { createTyped, Serie } from "@youwol/dataframe"

/**
 * Merge several objects loaded by any filter into one. Take care of the reindexation
 * of the topological elements (combinatorial elements of dim > 1, i.e., meshes lines,
 * meshed surfaces, meshed volumes)
 * @example
 * ```ts
 * const t1 = decodeGocadTS(bufferTS1)[0]
 * const t2 = decodeGocadTS(bufferTS2)[0]
 * const t3 = merge([t1.series.positions, t2.series.positions], [t1.series.indices, t2.series.indices])
 * ```
 */
export const merge = (positions: Serie[], indices: Serie[]) => {
    if (positions.length !== indices.length) throw new Error('positions an d indices length mismatch')

    if (positions.length === 1) {
        return {
            positions: positions[0],
            indices: indices[0]
        }
    }

    // We assume that each index of indices starts at 0  :-O
    let startIndex = 0
    const nodes: number[] = []
    const faces: number[] = []

    positions.forEach( (vertices, i) => {
        const triangles = indices[i]
        vertices.forEach( v => nodes.push(...v) )
        triangles.forEach( t => {
            faces.push( ...t.map( v => v+startIndex) )
        })
        startIndex += vertices.count
    })
    
    return {
        positions: Serie.create({
            array: createTyped(Float32Array, nodes, true),
            itemSize: 3
        }),
        indices: Serie.create({
            array: createTyped(Int32Array, faces, true),
            itemSize: 3
        })
    }
}
