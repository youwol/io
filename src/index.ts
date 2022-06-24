import {
    decodeGocadPL, 
    decodeGocadSO, 
    decodeGocadTS, 
    decodeGocadVS, 
    decodeOBJ, 
    decodeOFF, 
    decodeSTL, 
    decodeXYZ, 
    decoderDXF,
    decoderSVG,
    encodeGocadPL, 
    encodeGocadSO, 
    encodeGocadTS, 
    encodeGocadVS, 
    encodeOBJ, 
    encodeOFF, 
    encodeSTL, 
    encodeXYZ,
    encodeDXF,
    encodeSVG
} from './lib'



export * from './lib'

export type Entry = {
    encode : Function,
    decode : Function,
    vendor?: string,
    name?  : string
}

const map = new Map<string, Entry>()

/**
 * Usage for getting an encoder/decoder
 * ```js
 * const filename = 'myFile.obj'
 * const filter = IOFactory.getFilter(filename)
 * if (filter) {
 *      // buffer is the content of the file
 *      filter.decode(buffer, {shared: true})
 * }
 * ```
 * 
 * Usage for registering a new filter
 * ```js
 * // Register a decoder/encoder for the extension abc,
 * // where myEncoder and myDecoder are your 2 functions
 * IOFactory.registerFilter('abc', {encoder: myEncoder, decoder: myDecoder})
 * ```
 */
export const IOFactory = {
    registerFilter(extension: string, entry: Entry) {
        if (map.has(extension)) {
            console.warn(`WARNING: registering a new IO filter using the existing extension "${extension}"`)
        }
        map.set(extension, entry)
    },
    getFilter: (filename: string): Entry => {
        const extension = getExtension(filename)
        if (map.has(extension) === false) {
            console.warn(`WARNING: file "${filename}" has no encode/decode`)
            return undefined
        }
        return map.get(extension)
    }
}

IOFactory.registerFilter( 'vs' , {encode: encodeGocadVS, decode: decodeGocadVS, vendor: 'Gocad-team', name: 'gocad-pointset'} )
IOFactory.registerFilter( 'pl' , {encode: encodeGocadPL, decode: decodeGocadPL, vendor: 'Gocad-team', name: 'gocad-lineset'} )
IOFactory.registerFilter( 'ts' , {encode: encodeGocadTS, decode: decodeGocadTS, vendor: 'Gocad-team', name: 'gocad-surface'} )
IOFactory.registerFilter( 'gcd', {encode: encodeGocadTS, decode: decodeGocadTS, vendor: 'Gocad-team', name: 'gocad-surface'} ) // synomym
IOFactory.registerFilter( 'so' , {encode: encodeGocadSO, decode: decodeGocadSO, vendor: 'Gocad-team', name: 'gocad-volume'} )
IOFactory.registerFilter( 'xyz', {encode: encodeXYZ, decode: decodeXYZ, vendor: 'none', name: 'pointset'} )
IOFactory.registerFilter( 'obj', {encode: encodeOBJ, decode: decodeOBJ, vendor: 'Wavefront Technologies', name: 'wavefront'} )
IOFactory.registerFilter( 'off', {encode: encodeOFF, decode: decodeOFF, vendor: 'Geomview', name: 'object-file-format'} )
IOFactory.registerFilter( 'stl', {encode: encodeSTL, decode: decodeSTL, vendor: 'Albert Consulting Group', name: 'stl'} )
IOFactory.registerFilter( 'dxf', {encode: encodeDXF, decode: decoderDXF, vendor: 'Drawing eXchange Format', name: 'dxf'} )
IOFactory.registerFilter( 'svg', {encode: encodeSVG, decode: decoderSVG, vendor: 'Scalable Vector Graphics', name: 'svg'} )

// ------------------------------------------------------------

export function getExtension(filename: string) {
    return filename.substring(filename.lastIndexOf('.') + 1)
}
