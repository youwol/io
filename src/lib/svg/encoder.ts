import { DataFrame, Serie } from "@youwol/dataframe";
import { minMax } from "@youwol/math";

/**
 * Encode a set of lines given in DataFrame(s) in SVG format. Positions will be normalized in output and therefore
 * we introduce a scaling and trabslation in option.
 * 
 * Options are:
 * - scale = 1: The scaling factor of the normalized positions
 * - translate = [0,0]: The translation of the normalized positions defined as an array of 2 items: [0, 0]
 * - precision = 2: The number of digits
 * 
 * Note that the scaling is applied before the translation.
 * @category Encoder
 */
export function encodeSVG(dfs: DataFrame[] | DataFrame,
    {scale=100, translate=[0,0], precision=2}:{scale?: number, translate?: [number,number], precision?: number}
): string
{
    let buffer: string = `<svg width="100" height="100">\n`
    const point = p => `${p[0].toFixed(precision)} ${p[1].toFixed(precision)}`

    const doit = (df, positions) => {
        const serie = positions //df.series.positions
        const is3D  = serie.itemSize === 3
        if (serie.count % 2 !== 0) {
            throw new Error(`Wrong number of ${is3D?'3D':'2D'} points in the Serie. Have ${serie.count} and is not divisible by 2`)
        }

        const p1 = serie.itemAt(0)
        const p2 = serie.itemAt(1)
        let buffer = `  <path\n    style="stroke: rgb(0,0,0); stroke-width: 1; fill: none; opacity: 1;"\n    d="M ${point(p1)} L ${point(p2)} `
        
        for (let i=2; i<serie.count; i += 2) {
            const p1 = serie.itemAt(i  ) //as [number, number]
            const p2 = serie.itemAt(i+1) //as [number, number]
            buffer += `L ${point(p1)} `
        }

        buffer += '"\n  />\n'
        return buffer
    }

    const positions = normalize(dfs, scale, translate) // array of Serie or not

    if (Array.isArray(dfs)) {
        dfs.forEach( (df,i) => buffer += doit(df, positions[i]) )
        buffer += '</svg>'
        return buffer
    }

    buffer += doit(dfs, positions)
    buffer += '</svg>'
    return buffer
}

// -------------------------------------------------------------------

function normalize(dfs: DataFrame[] | DataFrame, scale: number, translate: [number,number]): Serie | Serie[] {
    let xmin = Number.POSITIVE_INFINITY
    let ymin = Number.POSITIVE_INFINITY
    let xmax = Number.NEGATIVE_INFINITY
    let ymax = Number.NEGATIVE_INFINITY

    const S = scale

    if (Array.isArray(dfs)) {
        dfs.forEach( df => {
            const is3D = df.series.positions.itemSize === 3
            const m = minMax(df.series.positions)
            if (m[0]<xmin) xmin = m[0]
            if (m[1]<ymin) ymin = m[1]
            if (is3D) {
                if (m[3]>xmax) xmax = m[3]
                if (m[4]>ymax) ymax = m[4]
            }
            else {
                if (m[2]>xmax) xmax = m[2]
                if (m[3]>ymax) ymax = m[3]
            }
        })

        const scale = Math.max(ymax-ymin, xmax-xmin)/S
        const positions = []
        dfs.forEach( df => {
            // NORMALIZE HERE
            positions.push( df.series.positions.map( p => [
                (p[0]-xmin)/scale+translate[0], 
                (p[1]-ymin)/scale+translate[1], 
                p[2]/scale]
            ) )
        })
        return positions
    }
    else {
        const is3D = dfs.series.positions.itemSize === 3
        const m = minMax(dfs.series.positions)
        xmin = m[0]
        ymin = m[1]
        if (is3D) {
            xmax = m[3]
            ymax = m[4]
        }
        else {
            xmax = m[2]
            ymax = m[3]
        }

        const scale = Math.max(ymax-ymin, xmax-xmin)/S
        return dfs.series.positions.map( p => [(p[0]-xmin)/scale, (p[1]-ymin)/scale, p[2]/scale] )
    }
}