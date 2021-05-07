import { ASerie, DataFrame } from "@youwol/dataframe"

export type XYZEncodeOptions = {
    saveAttributes: boolean,
    saveGeometry: boolean
}

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

    const positions = df.get('positions')
    if (positions === undefined) throw new Error('missing "positions" in dataframe')

    let buffer = ''

    let attrs: ASerie[] = []
    if (opts.saveAttributes) {
        df.series.forEach( (info, name) => {
            if (name !== 'positions') {
                if (info.serie.count !== positions.count) {
                    throw new Error(`attribute count mistmatch for '${info.serie.name}' (got ${info.serie.count}). Should be equal to 'positions' count (${positions.count})`)
                }
                attrs.push(info.serie)
            }
        })

        if (attrs.length > 0) {
            buffer += '# x y z '
            attrs.forEach( attr => buffer += attr.name+' ' )
            buffer += '\n'

            buffer += '# sizes '
            attrs.forEach( attr => buffer += attr.itemSize+' ' )
            buffer += '\n'
        }
        else {
            buffer += '# x y z\n'
        }
    }

    if (opts.saveGeometry) {
        positions.forEach( (item, i) => {
            buffer += `${item.join(' ')} `
            if (opts.saveAttributes) attrs.forEach( attr => buffer += `${toString(attr.itemAt(i))} ` )
            buffer += '\n'
        })
    }

    return buffer
}