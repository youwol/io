import { createTyped, DataFrame, Serie } from "@youwol/dataframe"
import { merge as mergeDfs } from '../merge'

/**
 * @category Decoder
 */
export function decodeOBJ(
    buffer: string,
    {shared=true, merge=true}:
    {shared?: boolean, merge?: boolean}={}): DataFrame[]
{
    const parser = new ParseOBJ
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

class ParseOBJ {
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
 
            if (lineFirstChar === 'v') {
                lineSecondChar = line.charAt(1)
                if (lineSecondChar === ' ' && (result = regexp.vertex_pattern.exec(line)) !== null) {
                    this.object.positions.push( parseFloat(result[1]), parseFloat(result[2]), parseFloat(result[3]) )
                }
            } else if (lineFirstChar === 'f') {
                if ((result = regexp.face_vertex_uv_normal.exec(line)) !== null) {
                    this.addFace(result[1], result[4], result[7], result[10])
                } else if ((result = regexp.face_vertex_uv.exec(line)) !== null) {
                    this.addFace(result[1], result[3], result[5], result[7])
                } else if ((result = regexp.face_vertex_normal.exec(line)) !== null) {
                    this.addFace(result[1], result[3], result[5], result[7]);
                } else if ((result = regexp.face_vertex.exec(line)) !== null) {
                    this.addFace(result[1], result[2], result[3], result[4])
                }
            } else if (lineFirstChar === 'l') {
                // line geom...
            } else if ((result = regexp.object_pattern.exec(line)) !== null) { 
                // "o" or "g"
                this.startObject( result[0].substr(1).trim() )
 
            } else if (regexp.material_use_pattern.test(line)) {
                // material...
            } else if (regexp.material_library_pattern.test(line)) {
                // mtl file...
            } else if ((result = regexp.smoothing_pattern.exec(line)) !== null) { 
                // smooth shading...
            } else { 
                // Handle null terminated files without exception
                if (line === '\0') continue
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


// ----------------------------------------------------------

const regexp = {
    vertex_pattern          : /^v\s+([\d|\.|\+|\-|e|E]+)\s+([\d|\.|\+|\-|e|E]+)\s+([\d|\.|\+|\-|e|E]+)/,
    face_vertex             : /^f\s+(-?\d+)\s+(-?\d+)\s+(-?\d+)(?:\s+(-?\d+))?/,
    face_vertex_uv          : /^f\s+(-?\d+)\/(-?\d+)\s+(-?\d+)\/(-?\d+)\s+(-?\d+)\/(-?\d+)(?:\s+(-?\d+)\/(-?\d+))?/,
    face_vertex_uv_normal   : /^f\s+(-?\d+)\/(-?\d+)\/(-?\d+)\s+(-?\d+)\/(-?\d+)\/(-?\d+)\s+(-?\d+)\/(-?\d+)\/(-?\d+)(?:\s+(-?\d+)\/(-?\d+)\/(-?\d+))?/,
    face_vertex_normal      : /^f\s+(-?\d+)\/\/(-?\d+)\s+(-?\d+)\/\/(-?\d+)\s+(-?\d+)\/\/(-?\d+)(?:\s+(-?\d+)\/\/(-?\d+))?/,
    object_pattern          : /^[o]\s*(.+)?/, // /^[og]\s*(.+)?/,
    smoothing_pattern       : /^s\s+(\d+|on|off)/,
    material_library_pattern: /^mtllib /,
    material_use_pattern    : /^usemtl /
}