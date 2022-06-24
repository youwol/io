import { Serie } from '@youwol/dataframe'

export type DxfReturnType = [number, number, number, number][]

/**
 * Decode a dxf file in the most simple form. We assume a list of:
 * ```txt
 * 999
 * And this is a comment (previous group is 999)
 * LINE
 * 8
 * Calque 1
 * 999 x1
 * 10
 * 6.425910
 * 999 y1
 * 20
 * 66.390800 
 * 999 x2
 * 11
 * 7.497000 
 * 999 y2
 * 21
 * 67.080556 
 * 0
 * ...
 * ```
 * @returns A serie with itemSize=2 (i.e., 2D points) and such that 2 consecutive points form a segments.
 * Therefore, the number of segments in the serie is simply the `serie.count/4``
 * 
 * @category Decoder
 */
export function decoderDXF(buffer: string): Serie {
    let lines = buffer.split('\n')

    const segments: Array<number> = []

    let i = 0
    const nextLine = () => {
        while (true) {
            if (i >= lines.length) {
                return undefined
            }
            const line = lines[i++]
            if (line.length !== 0) {
                let r = line.split(' ')
                if (r.length !== 0) {
                    return r
                }
            }
        }
    }

    while (true) {
        let r = nextLine()
        if (r === undefined) {
            break
        }
        if (r[0] === 'LINE') {
            nextLine(); nextLine(); nextLine()
            const x1 = parseFloat(nextLine()[0])
            nextLine()
            const y1 = parseFloat(nextLine()[0])
            nextLine()
            const x2 = parseFloat(nextLine()[0])
            nextLine()
            const y2 = parseFloat(nextLine()[0])
            segments.push(x1, y1, x2, y2)
        }
    }

    return Serie.create({array: segments, itemSize: 2})
}

const trimAll = (s: string) => s.replace(/\s+/g, ' ').replace(/^\s+|\s+$/, '').replace('\t', ' ').trimEnd()
