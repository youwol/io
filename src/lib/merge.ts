import { createTyped, DataFrame, Serie } from "@youwol/dataframe"

type Key = {
    nbr: number,
    count: number,
    itemSize: number
}

/**
 * Merge several objects loaded by any filter into one. Take care of the reindexation
 * of the topological elements if any (combinatorial elements of dim > 1, i.e., meshes lines,
 * meshed surfaces, meshed volumes).
 * Also, attributes (other series) are merged as well if and only if they have the same
 * count and itemSize.
 * @example
 * ```ts
 * const t1 = decodeGocadTS(bufferTS1)[0]
 * const t2 = decodeGocadTS(bufferTS2)[0]
 * const t3 = merge([t1, t2])
 * ```
 */
export const merge = (dataframes: DataFrame[]): DataFrame => {
    if (dataframes.length === 0) throw new Error('no dataframe provided')
    if (dataframes.length === 1) return dataframes[0]

    const names: {[key:string]: Key} = {}
    dataframes.forEach( df => {
        for (const [key, value] of Object.entries(df.series)) {
            if (names[key] !== undefined) {
                if (value.count === names[key].count && value.itemSize === names[key].itemSize ) {
                    names[key].nbr++
                }
            }
            else {
                names[key] = {
                    nbr: 1,
                    count: value.count,
                    itemSize: value.itemSize
                }
            }
        }
    })
    const candidates: string[] = []
    for (const [key, value] of Object.entries(names)) {
        if (value.nbr === dataframes.length) {
            candidates.push(key)
        }
    }

    const df = DataFrame.create( { series: {} } )
    candidates.forEach( name => {
        const series = gatherSeries(dataframes, name)
        if (series) df.series[name] = mergeSeries( series )
    })

    // Doing indices again since it is a special case
    //
    if (dataframes[0].series.indices !== undefined) {
        const faces: number[] = []
        let startIndex = 0
        dataframes.forEach( (dataframe, i) => {
            const triangles = dataframe.series.indices
            if (triangles===undefined) throw new Error('objects in dataframes are in different types')
            triangles.forEach( t => {
                faces.push( ...t.map( v => v+startIndex) )
            })
            startIndex += dataframe.series.positions.count
        })
        df.series.indices = Serie.create({array: createTyped(Int32Array, faces, true), itemSize: 3})
    }

    return df
}



function gatherSeries(dfs: DataFrame[], name: string): Serie[] {
    const series: Serie[] = []
    dfs.forEach( (df,i) => {
        const s = df.series[name]
        if (s === undefined) return undefined //throw new Error(`Serie ${name} does not exist in dataframe index ${i}`)
        series.push(s)
    })

    return series
}

function mergeSeries(s: Serie[]): Serie {
    if (s.length===0) throw new Error('no series provided')
    if (s.length===1) return s[0]

    // check sizes and itemsizes
    let ok         = true
    const count    = s[0].count
    const itemSize = s[0].itemSize
    s.forEach( serie => ok  = ok && (serie.count === count && serie.itemSize === itemSize) )

    if (!ok) throw new Error("Series don't have the same count or itemSize")

    const n  = s[0].array.length
    const nn = n*s.length
    const array = new Array(nn).fill(0)
    let id = 0
    s.forEach( serie => {
        for (let i=0; i<n; ++i) {
            array[id++] = serie.array[i]
        }
    })
    
    return Serie.create({array, itemSize: s[0].itemSize})
}