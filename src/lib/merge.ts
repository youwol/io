import { createTyped, DataFrame, Serie } from "@youwol/dataframe"

type Key = {
    nbr     : number,
    count   : number,
    itemSize: number
}

/**
 * Merge several objects loaded by any filter into one. Take care of the reindexation
 * of the topological elements if any (combinatorial elements of dim > 1, i.e., meshes lines,
 * meshed surfaces, meshed volumes).
 * Also, attributes (other series) are merged as well if and only if they have the same
 * name and itemSize.
 * @example
 * ```ts
 * import { decodeGocadTS, merge } from '@youwol/io'
 * 
 * const t1 = decodeGocadTS(bufferTS1)
 * const t2 = decodeGocadTS(bufferTS2)
 * const t3 = merge([...t1, ...t2])
 * ```
 */
export const merge = (dataframes: DataFrame[]): DataFrame => {
    if (dataframes.length === 0) throw new Error('no dataframe provided')
    if (dataframes.length === 1) return dataframes[0]

    const keys: {[key:string]: Key} = {}

    dataframes.forEach( df => {
        for (const [name, serie] of Object.entries(df.series)) {
            const entry = keys[name]
            if (entry !== undefined) {
                if (/*serie.count === entry.count &&*/ serie.itemSize === entry.itemSize ) {
                    entry.nbr++
                    entry.count += serie.count
                }
            }
            else {
                keys[name] = {
                    nbr     : 1,
                    count   : serie.count,
                    itemSize: serie.itemSize
                }
            }
        }
    })

    // console.log(keys)

    const candidates: string[] = []
    for (const [name, key] of Object.entries(keys)) {
        if (key.nbr === dataframes.length) {
            candidates.push(name)
        }
    }

    const df = DataFrame.create({ series: {} })
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

function mergeSeries(series: Serie[]): Serie {
    if (series.length===0) throw new Error('no series provided')
    if (series.length===1) return series[0]

    // check itemsizes
    const itemSize = series[0].itemSize
    const ok = series.reduce( (cur, serie) => cur && (serie.itemSize === itemSize), true )
    if (!ok) {
        throw new Error("Series don't have the same itemSize")
    }

    const N = series.reduce( (cur, serie) => cur+serie.count, 0) * itemSize
    const array = new Array(N).fill(0)
    let id = 0
    series.forEach( serie => {
        for (let i=0; i<serie.array.length; ++i) {
            array[id++] = serie.array[i]
        }
    })
    
    return Serie.create({array, itemSize})
}