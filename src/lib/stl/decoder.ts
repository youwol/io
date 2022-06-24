import { createTyped, DataFrame, Serie } from "@youwol/dataframe"


// Inspired from three.js


/**
 * Decode STL files either in ASCII or in BINARY format.
 * When usnig node.js, you should be carreful of how you read the data before
 * calling [[decodeSTL]].
 * 
 * For example, for **ASCII** file, you should use:
 * ```js
 * const array = fs.readFileSync('object.stl', 'utf8')
 * const state = loaders.decodeSTL(array)
 * ```
 * And when using **BINARY** file, you should remove the `utf8` encoding and use the `buffer`
 * of the return array:
 * ```js
 * const array = fs.readFileSync('object.stl')
 * const state = loaders.decodeSTL(array.buffer)
 * ```
 * @param buffer 
 * @param param1 
 * @returns 
 * 
 * @category Decoder
 */
export function decodeSTL(
    buffer: string | ArrayBufferLike,
    {shared=true}:
    {shared?: boolean}={}): DataFrame[]
{
    const binData = ensureBinary(buffer)
    const object = isBinary(binData) ? parseBinary( binData, shared ) : parseASCII( ensureString(buffer), shared )

    const dataframe = DataFrame.create({
        series: {
            positions: Serie.create({array: object.positions, itemSize: 3}),
            indices  : Serie.create({array: object.indices  , itemSize: 3})
        }
    })

    return [dataframe]
}

const littleEndian = true

function ensureBinary( buffer: ArrayBufferLike | string ) {
    if ( typeof buffer === 'string' ) {
        const array_buffer = new Uint8Array( buffer.length )
        for ( let i = 0; i < buffer.length; i ++ ) {
            array_buffer[ i ] = buffer.charCodeAt( i ) & 0xff // assumes little-endian
        }
        return array_buffer.buffer || array_buffer
    } else {
        return buffer
    }
}

function decodeText( array ) {
    if ( typeof TextDecoder !== 'undefined' ) {
        return new TextDecoder().decode( array )
    }
    let s = ''
    for ( let i = 0, il = array.length; i < il; i ++ ) {
        // assumes little-endian
        s += String.fromCharCode( array[ i ] )
    }
    try {
        // merges multi-byte utf-8 characters.
        return decodeURIComponent( escape( s ) )
    } catch ( e ) { // see #16358
        return s
    }
}

function ensureString( buffer ) {
    if ( typeof buffer !== 'string' ) {
        return decodeText( new Uint8Array( buffer ) )
    }
    return buffer
}

function parseBinary( data: ArrayBufferLike, shared: boolean) {
    const reader = new DataView( data )
    const faces = reader.getUint32( 80, littleEndian )

    const dataOffset = 84
    const faceLength = 12 * 4 + 2
    const vertices   = new Array(faces*3*3).fill(0)
    const indices    = new Array(faces*3).fill(0)

    let vertexID = 0
    for ( let face = 0; face < faces; face++ ) {
        const start = dataOffset + face * faceLength

        for ( let i = 1; i <= 3; i ++ ) {
            const vertexstart  = start + i*12
            const componentIdx = face*9 + (i-1)*3

            // Coordinates
            vertices[ componentIdx     ] = reader.getFloat32( vertexstart    , littleEndian ) // x
            vertices[ componentIdx + 1 ] = reader.getFloat32( vertexstart + 4, littleEndian ) // y
            vertices[ componentIdx + 2 ] = reader.getFloat32( vertexstart + 8, littleEndian ) // z
            
            indices[componentIdx  ] = vertexID++
            indices[componentIdx+1] = vertexID++
            indices[componentIdx+2] = vertexID++
        }
    }

    return {
        positions: createTyped<Float32Array>(Float32Array, vertices, shared),
        indices  : createTyped<Uint32Array>(Uint32Array, indices, shared)
    }
}

function parseASCII( data: string, shared: boolean) {
    const patternSolid  = /solid([\s\S]*?)endsolid/g
    const patternFace   = /facet([\s\S]*?)endfacet/g
    const patternFloat  = /[\s]+([+-]?(?:\d*)(?:\.\d*)?(?:[eE][+-]?\d+)?)/.source
    const patternVertex = new RegExp( 'vertex' + patternFloat + patternFloat + patternFloat, 'g' )

    let faceCounter = 0
    let startVertex = 0
    let endVertex   = 0
    const vertices  = []
    const indices   = []
    let result: any

    let faceID = 0

    while ( ( result = patternSolid.exec( data ) ) !== null ) {
        startVertex = endVertex
        const solid = result[ 0 ]

        while ( ( result = patternFace.exec( solid ) ) !== null ) {
            let vertexCountPerFace = 0
            const text = result[ 0 ]

            while ( ( result = patternVertex.exec( text ) ) !== null ) {
                vertices.push( parseFloat( result[ 1 ] ), parseFloat( result[ 2 ] ), parseFloat( result[ 3 ] ) )
                vertexCountPerFace++
                endVertex ++
                indices.push(faceID++)
            }

            if ( vertexCountPerFace !== 3 ) {
                throw new Error('decodeSTL: number of vertices per face must be 3')
            }

            faceCounter++
        }
    }

    return {
        positions: createTyped<Float32Array>(Float32Array, vertices, shared),
        indices  : createTyped<Uint32Array>(Uint32Array, indices, shared)
    }
}

function isBinary( data: any ) {
    const reader    = new DataView( data )
    const face_size = 32/8*3 + (32/8*3)*3 + 16/8
    const n_faces   = reader.getUint32( 80, littleEndian )
    const expect    = 80 + 32/8 + n_faces*face_size

    if ( expect === reader.byteLength ) {
        return true
    }
    const solid = [ 115, 111, 108, 105, 100 ]

    for ( let off = 0; off < 5; off ++ ) {
        if ( matchDataViewAt( solid, reader, off ) ) return false
    }
    return true
}

function matchDataViewAt( query, reader, offset ) {
    for ( let i = 0, il = query.length; i < il; i ++ ) {
        if ( query[ i ] !== reader.getUint8(offset+i) ) return false;
    }
    return true
}