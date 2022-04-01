import { Serie, DataFrame } from "@youwol/dataframe"
import { encodeUserData } from "../utils";

const mapTensors = new Map<number, Array<string>>()
mapTensors.set(3, ['x', 'y', 'z']);
mapTensors.set(6, ['xx', 'xy', 'xz', 'yy', 'yz', 'zz']);
mapTensors.set(9, ['xx', 'xy', 'xz', 'yx', 'yy', 'yz', 'zx', 'zy', 'zz']);

/**
 * Options for getting a buffer (string) in XYZ format
 * @category Options
 */
export type XYZEncodeOptions = {
    /**
     * Save or not the attributes. Default is true
     */
    saveAttributes?: boolean,
    /**
     * Save or not the point geometry. Default is true
     */
    saveGeometry?: boolean,
    /**
     * The delimiter for the number. Default is one space
     */
    delimiter?: string,
    /**
     * The number of digits. Default is undefined and will not fixe the digits (number
     * will be "as is")
     */
    fixed?: number,

    expandAttributes: boolean, // true

    /**
     * Any user data (undefined by default)
     */
    userData        : {[key:string]: any} // undefined
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
    const r = {saveAttributes: true, saveGeometry: true, delimiter: ' ', fixed: 12, expandAttributes: true, userData: undefined}
    if (o === undefined) return r
    r.saveAttributes = o.saveAttributes !== undefined ? o.saveAttributes : true
    r.saveGeometry   = o.saveGeometry   !== undefined ? o.saveGeometry : true
    r.delimiter      = o.delimiter      !== undefined ? o.delimiter : ' '
    r.fixed          = o.fixed          !== undefined ? o.fixed : undefined
    r.userData       = o.userData

    if (o.expandAttributes !== undefined && o.expandAttributes === false) {
        console.warn('WARNING: XYZEncodeOptions.expandAttributes is not active yet for the xyz format')
    }
    //r.expandAttributes = o.expandAttributes !== undefined ? o.expandAttributes : true

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

    let buffer = encodeUserData(opts.userData)

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
            if (opts.expandAttributes === false) {
                attrs.forEach( ([name, _]) => buffer += name+' ' )
                buffer += '\n# SIZES '
                attrs.forEach( ([_, serie]) => buffer += serie.itemSize+' ' )
                buffer += '\n'
            }
            else {
                attrs.forEach( ([name, serie]) => {
                    if (serie.itemSize === 1) {
                        buffer += `${name} `
                    }
                    else {
                        const names = mapTensors.get(serie.itemSize)
                        if (names === undefined) {
                            for (let j=0; j<serie.itemSize; ++j) {
                                buffer += `${name}${j} `
                            }
                        }
                        else {
                            names.forEach( n => {
                                buffer += `${name}${n} `
                            })
                        }
                    }
                })
            }
            buffer += '\n'

            // buffer += '# sizes '
            // attrs.forEach( ([_, serie]) => buffer += serie.itemSize+' ' )
            // buffer += '\n'
        }
        else {
            buffer += '# x y z\n'
        }
    }

    const doFixed = opts.fixed !== undefined


    positions.forEach( (item, i) => {
        if (opts.saveGeometry) {
            //buffer += `${item.join(opts.delimiter)}` + opts.delimiter
            for (let j=0; j<item.length; ++j) {
                if (doFixed) buffer += `${item[j].toFixed(opts.fixed)}` + opts.delimiter
                else         buffer += `${toString(item[j])}` + opts.delimiter
            }
        }
        if (opts.saveAttributes) {
            attrs.forEach( ([_, serie]) => {
                if (serie.itemSize===1) {
                    let num = serie.itemAt(i) as number
                    if (doFixed) buffer += `${num.toFixed(opts.fixed)}` + opts.delimiter
                    else         buffer += `${toString(num)}` + opts.delimiter
                }
                else {
                    let num = serie.itemAt(i) as number[]
                    for (let j=0; j<num.length; ++j) {
                        if (doFixed) buffer += `${num[j].toFixed(opts.fixed)}` + opts.delimiter
                        else         buffer += `${toString(num[j])}` + opts.delimiter
                    }
                }
                //buffer += `${toString(serie.itemAt(i))}` + opts.delimiter
            })
        }
        buffer += '\n'
    })

    return buffer
}