import { Serie, DataFrame } from "@youwol/dataframe"
import { encodeUserData } from '../utils'

/**
 * @category Options
 */
export type GocadEncodeOptions = {
    saveAttributes  : boolean, // true
    saveTopology    : boolean, // true
    saveGeometry    : boolean, // true
    expandAttributes: boolean, // false
    userData        : {[key:string]: any} // undefined
}

/**
 * Get the buffer object of a Gocad pointset 
 * @category Encoder
 */
 export function encodeGocadVS(dfs: DataFrame[] | DataFrame, options: GocadEncodeOptions = undefined): string {
    let buffer = ''

    const doit = df => encodeGocadObject({
        df,
        combelSize: 1,
        combelName: '',
        header    : 'GOCAD VSet 1.0\nHEADER: {\nname: no-name\n}\n',
        options
    })

    if (Array.isArray(dfs)) {
        dfs.forEach( df => buffer += doit(df) )
        return buffer
    }
    return doit(dfs)
}

/**
 * Get the buffer object of a Gocad lineset 
 * @category Encoder
 */
 export function encodeGocadPL(dfs: DataFrame[] | DataFrame, options: GocadEncodeOptions = undefined): string {
    let buffer = ''

    const doit = df => encodeGocadObject({
        df,
        combelSize: 2,
        combelName: 'SEG',
        header    : 'GOCAD PLine 1.0\nHEADER: {\nname: no-name\n}\n',
        options
    })

    if (Array.isArray(dfs)) {
        dfs.forEach( df => buffer += doit(df) )
        return buffer
    }
    return doit(dfs)
}

/**
 * Get the buffer object of a Gocad triangulated surface 
 * @category Encoder
 */
 export function encodeGocadTS(dfs: DataFrame[] | DataFrame, options: GocadEncodeOptions = undefined): string {
    let buffer = ''

    const doit = df => encodeGocadObject({
        df,
        combelSize: 3,
        combelName: 'TRGL',
        header    : 'GOCAD TSurf 1.0\nHEADER: {\nname: no-name\n}\n',
        options
    })

    if (Array.isArray(dfs)) {
        dfs.forEach( df => buffer += doit(df) )
        return buffer
    }
    return doit(dfs)
}

/**
 * Get the buffer object of a Gocad volume 
 * @category Encoder
 */
 export function encodeGocadSO(dfs: DataFrame[] | DataFrame, options: GocadEncodeOptions = undefined): string {
    let buffer = ''

    const doit = df => encodeGocadObject({
        df,
        combelSize: 4,
        combelName: 'TETRA',
        header    : 'GOCAD TSolid 1.0\nHEADER: {\nname: no-name\n}\n',
        options
    })

    if (Array.isArray(dfs)) {
        dfs.forEach( df => buffer += doit(df) )
        return buffer
    }
    return doit(dfs)
}

// ------------------------------------------------------------

const getGocadEncodeOptions = (options: GocadEncodeOptions): GocadEncodeOptions => {
    const r = {
        saveAttributes: true,
        saveTopology: true,
        saveGeometry: true,
        expandAttributes: false,
        userData: undefined
    }
    if (options === undefined) {
        return r
    }
    r.saveAttributes   = options.saveAttributes   !== undefined ? options.saveAttributes   : true
    r.saveTopology     = options.saveTopology     !== undefined ? options.saveTopology     : true
    r.saveGeometry     = options.saveGeometry     !== undefined ? options.saveGeometry     : true
    r.expandAttributes = options.expandAttributes !== undefined ? options.expandAttributes : false
    r.userData = options.userData
    return r
}

const toString = (n: number|number[]) => Array.isArray(n) ? n.join(' ') : n

// Only one object right now
function encodeGocadObject(
    {header, combelSize, combelName, df, options}:
    {header: string, combelSize?: number, combelName?: string, df: DataFrame, options?: GocadEncodeOptions}
): string
{
    const opts = getGocadEncodeOptions(options)

    const positions = df.series.positions
    if (positions === undefined) throw new Error('missing "positions" in dataframe')

    const indices   = df.series.indices

    let buffer = header
    
    if (df.userData && df.userData.name) {
        buffer = buffer.replace('no-name', df.userData.name)
    }

    buffer += encodeUserData(opts.userData)

    let attrs: Array<[string, Serie]> = []

    // Do the properties
    if (opts.saveAttributes) {
        Object.entries(df.series).forEach( ([name, serie]: [string, Serie]) => {
            if (name !== 'positions' && name !=='indices') {
                if (serie.count !== positions.count) {
                    let msg = `attribute count mistmatch for '${name}' (got ${serie.count}).
Should be equal to 'positions' count (${positions.count}).\n`
                    if (serie.count === indices.count) {
                        throw new Error(msg+
                            'Did you forget to export at nodes instead of triangles?\n')
                    }
                    else {
                        throw new Error(msg)
                    }
                }
                attrs.push([name, serie])
            }
        })

        if (attrs.length > 0) {
            if (opts.expandAttributes===false) {
                buffer += 'PROPERTIES '
                attrs.forEach( ([name, _]) => buffer += name+' ' )
                buffer += '\nESIZES '
                attrs.forEach( ([_, serie]) => buffer += serie.itemSize+' ' )
                buffer += '\n'
            }
            else {
                buffer += 'PROPERTIES '
                let n = 0
                attrs.forEach( ([name, serie]) => {
                    if (serie.itemSize === 1) {
                        n++
                        return buffer += name+' '
                    }
                    else if (serie.itemSize === 3) {
                        n += 3
                        return buffer += name+'x ' + name+'y ' + name+'z '
                    }
                    else if (serie.itemSize === 6) {
                        n += 3
                        return buffer += name+'xx ' + name+'xy ' + name+'xz ' + name+'yy ' + name+'yz ' + name+'zz '
                    }
                    else if (serie.itemSize === 9) {
                        n += 3
                        return buffer += name+'xx ' + name+'xy ' + name+'xz ' + name+'yx ' + name+'yy ' + name+'yz ' + name+'zx ' + name+'zy ' + name+'zz '
                    }
                    else {
                        for (let i=1; i<=serie.itemSize; ++i) {
                            n++
                            buffer += `${name}${i} `
                        }
                        return buffer
                    }
                })
                // buffer += '\nESIZES '
                // for (let i=0; i<n; ++i) {
                //     buffer += `1 `
                // }
                buffer += '\n'
            }
        }
    }
    const suffix = attrs.length > 0 ? "PVRTX" : "VRTX"

    // Do the positions and attributes
    if (opts.saveGeometry) {
        positions.forEach( (item, i) => {
            buffer += `${suffix}  ${i} ${item.join(' ')} `
            if (opts.saveAttributes) attrs.forEach( ([_, serie])  => buffer += `${toString(serie.itemAt(i))} ` )
            buffer += '\n'
        })
    }

    // Do the indices
    if (indices && opts.saveTopology) {
        indices.forEach( item => buffer += `${combelName} ${item.join(' ')}\n` )
    }

    return buffer + 'END\n'
}
