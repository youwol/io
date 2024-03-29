import { DataFrame } from '@youwol/dataframe'

/**
 * @category Encoder
 */
export function encodeDXF(dfs: DataFrame[] | DataFrame): string {
    /*
    let xmin = Number.POSITIVE_INFINITY
    let ymin = Number.POSITIVE_INFINITY
    let xmax = Number.NEGATIVE_INFINITY
    let ymax = Number.NEGATIVE_INFINITY
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
    }
    */
    const xmin = 0
    const ymin = 0
    const xmax = 10
    const ymax = 10

    let buffer = `999
"Generated by YouWol"
    0 
SECTION
    2 
HEADER
    9 
$ACADVER
    1 
AC1009
    9 
$EXTMIN
    10 
    ${xmin} 
    20 
    ${ymin}
    9 
$EXTMAX
    10 
    ${xmax}
    20 
    ${ymax}
    0 
ENDSEC
    0 
SECTION
    2 
ENTITIES
`

    const doit = (df) => {
        const serie = df.series.positions
        const is3D = serie.itemSize === 3
        if (serie.count % 2 !== 0) {
            throw new Error(
                `Wrong number of ${
                    is3D ? '3D' : '2D'
                } points in the Serie. Have ${
                    serie.count
                } and is not divisible by 2`,
            )
        }

        let buffer = ''

        for (let i = 0; i < serie.count; i += 2) {
            const p1 = serie.itemAt(i) //as [number, number]
            const p2 = serie.itemAt(i + 1) //as [number, number]
            buffer += genSegment(p1, p2)
        }

        // buffer += `ENDSEC\n0\nEOF`
        return buffer
    }

    if (Array.isArray(dfs)) {
        dfs.forEach((df) => (buffer += doit(df)))
        buffer += `0\nENDSEC\n0\nEOF`
        return buffer
    }

    buffer += doit(dfs)
    buffer += `0\nENDSEC\n0\nEOF`
    return buffer
}

function genSegment(p1: [number, number], p2: [number, number]) {
    //return `0\nLINE\n8\nCalque 1\n10\n${p1[0]}\n20\n${p1[1]}\n11\n${p2[0]}\n21\n${p2[1]}\n`
    return `0\nLINE\n10\n${p1[0].toFixed(2)}\n20\n${p1[1].toFixed(
        2,
    )}\n30\n0\n11\n${p2[0].toFixed(2)}\n21\n${p2[1].toFixed(2)}\n31\n0\n`
}
