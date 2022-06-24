import { createTyped, DataFrame, Serie } from "@youwol/dataframe"
import { merge as mergeDfs } from '../merge'

/**
 * @category Decoder
 */
export function decodeOFF(
    buffer: string,
    {shared=true, merge=true}:
    {shared?: boolean, merge?: boolean}={}): DataFrame[]
{
    const parser = new ParseOFF
    parser.parse(buffer)

    const dataframes: DataFrame[] = []

    parser.meshes.forEach( mesh => {
        const dataframe = DataFrame.create({
            series: {
                positions: Serie.create({array: createTyped<Float32Array>(Float32Array, mesh.positions, shared), itemSize: 3}),
                indices  : Serie.create({array: createTyped<Uint32Array>(Uint32Array, mesh.indices, shared), itemSize: 3})
            }
        })
        dataframes.push(dataframe)
    })

    if (merge) {
        return [mergeDfs(dataframes)]
    }

    return dataframes
}

// ----------------------------------------------

type MeshObject = {
    id       : string
    positions: number[],
    indices  : number[]
}

class ParseOFF {
    private object : MeshObject = undefined
    private objects: MeshObject[] = []

    get meshes() {
        this.object = undefined
        return this.objects
    }

    parse(buffer: string): void { 
        if (buffer.indexOf('\r\n') !== -1) {
            buffer = buffer.replace('\r\n', '\n')
        }
 
        const lines = buffer.split('\n')
        let line = '', lineFirstChar = '', lineSecondChar = ''
        let lineLength = 0
        let result = []
 
        // Faster to just trim left side of the line. Use if available.
        const trimLeft = (typeof ''.trimLeft === 'function')

        let isOff = false
        let readNbs = false
        let nbV = 0
        let nbF = 0

        this.startObject("off-surface")
 
        for (let i = 0, l = lines.length; i < l; i++) {
            line = lines[i]
            line = trimLeft ? line.trimLeft() : line.trim()
            lineLength = line.length
 
            if (lineLength === 0) {
                continue
            }
            lineFirstChar = line.charAt(0)
 
            if (lineFirstChar === '#') {
                continue
            }

            if (line === '\0') continue

            if (line === 'OFF') {
                isOff = true
            }

            let toks = line.split(' ').map( (s: string) => s.trim()).filter ( (s: string) => s!=='')

            if (isOff && !readNbs) {
                if (toks.length === 3) {
                    readNbs = true
                    nbV = parseFloat(toks[0])
                    nbF = parseFloat(toks[1])
                    continue
                }
            }

            if (readNbs && toks.length === 3) {
                this.object.positions.push( parseFloat(toks[0]), parseFloat(toks[1]), parseFloat(toks[2]) )
                continue
            }
 
            if (readNbs && toks.length >= 4) {
                const n = parseInt(toks[0])
                if (n === 3) {
                    this.addFace(toks[1], toks[2], toks[3])
                }
                else if (n === 4) {
                    this.addFace(toks[1], toks[2], toks[3], toks[4])
                }
            }
        }
    }
 
    startObject(id: string) {
        this.object = {
            id: id,
            positions: [],
            indices  : []
        }
        this.objects.push(this.object)
    }
 
    addFace(a: string, b: string, c: string, d?: string) {
        if (d === undefined) {
            this.object.indices.push(parseInt(a), parseInt(b), parseInt(c))
        } else {
            this.object.indices.push(parseInt(a), parseInt(b), parseInt(d))
            this.object.indices.push(parseInt(b), parseInt(c), parseInt(d))
        }
    }
}
