import { Serie, DataFrame } from "@youwol/dataframe"

/**
 * @category Options
 */
export type XYZEncodeOptions = {
    saveAttributes: boolean,
    saveGeometry: boolean
}

/**
 * Get the buffer object of an xyz pointset 
 * @category Encoder
 */
export function encodeXYZ(dfs: DataFrame[] | DataFrame, options: XYZEncodeOptions = undefined): string {
    let buffer = ''

    if (Array.isArray(dfs)) {
        dfs.forEach( df => buffer += doit(df, options) )
        return buffer
    }
    
    return doit(dfs, options)
}

// ------------------------------------------------------------------------

const getXYZEncodeOptions = (o: XYZEncodeOptions): XYZEncodeOptions => {
    const r = {saveAttributes: true, saveGeometry: true}
    if (o === undefined) return r
    r.saveAttributes = o.saveAttributes!==undefined ? o.saveAttributes : true
    r.saveGeometry = o.saveGeometry!==undefined ? o.saveGeometry : true
    return r
}

const toString = (n: number|number[]) => Array.isArray(n) ? n.join(' ') : n

const doit = (df: DataFrame, options: XYZEncodeOptions): string => {
    // Take care of ESIZES:
    // # x y z   a b c
    // # SIZES   1 3 6 # default 1 1 1

    const opts = getXYZEncodeOptions(options)

    const positions = df.series.positions
    if (positions === undefined) throw new Error('missing "positions" in dataframe')

    let buffer = ''

    let attrs: Array<[string,Serie]> = []
    if (opts.saveAttributes) {
        Object.entries(df.series).forEach( ([name, serie]:[string,Serie]) => {
            if (name !== 'positions') {
                if (serie.count !== positions.count) {
                    throw new Error(`attribute count mistmatch for '${name}' (got ${serie.count}). Should be equal to 'positions' count (${positions.count})`)
                }
                attrs.push([name, serie])
            }
        })

        if (attrs.length > 0) {
            buffer += '# x y z '
            //attrs.forEach( ([name, _]) => buffer += name+' ' )
            attrs.forEach( ([name, serie]) => {
                for (let j=0; j<serie.itemSize; ++j) {
                    buffer += `name${j} `
                }
            })
            buffer += '\n'

            // buffer += '# sizes '
            // attrs.forEach( ([_, serie]) => buffer += serie.itemSize+' ' )
            // buffer += '\n'
        }
        else {
            buffer += '# x y z\n'
        }
    }

    if (opts.saveGeometry) {
        positions.forEach( (item, i) => {
            buffer += `${item.join(' ')} `
            if (opts.saveAttributes) {
                attrs.forEach( ([_, serie]) => buffer += `${toString(serie.itemAt(i))} ` )
            }
            buffer += '\n'
        })
    }

    return buffer
}