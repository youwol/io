import { DataFrame, IArray, createSerie, createTyped, append } from '@youwol/dataframe'
import { collapse } from '../collapse'
import { concatenate } from '../concatenate'
import { trimAll } from '../utils'

/**
 * Create a Gocad Pointset (DataFrame) from a string buffer
 * @category Decoder
 */
export function decodeGocadVS(
    buffer: string,
    {shared=true, merge=true}:{shared?: boolean, merge?: boolean}={}): DataFrame[]
{
    return loadGocadObject({
        buffer, 
        keyword: '',
        separator: 'SUBVSET',
        dimension: 1,
        className: 'Pointset',
        extension: 'vs',
        shared,
        merge
    })
}

/**
 * Create a Gocad Polyline (DataFrame) from a string buffer
 * @category Decoder
 */
export function decodeGocadPL(
    buffer: string,
    {shared=true, merge=true}:{shared?: boolean, merge?: boolean}={}): DataFrame[]
{
    return loadGocadObject({
        buffer, 
        keyword: 'SEG',
        separator: 'ILINE',
        dimension: 2,
        className: 'Polyline',
        extension: 'pl',
        shared,
        merge
    })
}

/**
 * Create a Gocad Surface (DataFrame) from a string buffer
 * @category Decoder
 */
export function decodeGocadTS(
    buffer: string,
    {shared=true, merge=true}:{shared?: boolean, merge?: boolean}={}): DataFrame[]
{
    return loadGocadObject({
        buffer, 
        keyword: 'TRGL',
        separator: 'TFACE',
        dimension: 3,
        className: 'Surface',
        extension: 'ts',
        shared,
        merge
    })
}

/**
 * Create a Gocad Voule (DataFrame) from a string buffer
 * @category Decoder
 */
export function decodeGocadSO(
    buffer: string,
    {shared=true, merge=true}:{shared?: boolean, merge?: boolean}={}): DataFrame[]
{
    return loadGocadObject({
        buffer, 
        keyword: 'TETRA',
        separator: 'TVOLUME',
        dimension: 4,
        className: 'Volume',
        extension: 'so',
        shared,
        merge
    })
}

// ---------------------------------------------------------------------

function loadGocadObject(
    {buffer, keyword, separator, dimension, className, extension, shared, merge}:
    {
        buffer: string, 
        keyword: string, 
        separator: string, 
        dimension: number, 
        className: string,
        extension: string,
        shared: boolean,
        merge: boolean
    }): DataFrame[]
{
    let lines      = buffer.split('\n')
    let name       = 'no-name'

    let attributes: number[][] = []
    let attrNames : string[]   = []
    let attrSizes : number[]   = []
    let nbFlatAttributes = -1

    let startIndex = 0
    let nbVertices = 0
    let positions  = []
    let indices    = []

    let objects: DataFrame[] = []
    
    const haveIndices = (keyword !== '')
    const SEP = separator

    for (let i = 0; i < lines.length; ++i) {
        let line = trimAll(lines[i])
        if (line.length === 0 || line.charAt(0) === '#') {
            continue
        }

        let r = line.split(' ').map( (s: string) => s.trim()).filter ( (s: string) => s!=='')
        if (r.length === 0) {
            continue
        }

        let names = line.split(':')
        if (names.length === 0) {
            continue
        }

        if (names[0] === 'name' && names.length > 1) {
            name = trimAll(names[1])
            continue
        }

        if (r[0] === SEP) {
            // new object
            const object = createObject({
                positions, indices, attrNames, attrSizes, attributes, 
                itemSize: dimension, shared, name,
                className, extension, merge
            })
            if (object) objects.push( object )

            // Use the same attributes
            attributes.forEach( array => array = [] )
            positions  = []
            indices    = []
            startIndex = nbVertices // DO NOT reset the increment of the indices for components
            continue
        }

        if (r[0] === 'GOCAD') {
            const object = createObject({
                positions, indices, attrNames, attrSizes, attributes,
                itemSize: dimension, shared, name,
                className, extension, merge
            })
            if (object) objects.push( object )
            
            name = 'no-name'
            attributes = []
            attrNames  = []
            nbFlatAttributes = -1
            positions   = []
            indices    = []
            startIndex = 0
            nbVertices = 0
            continue
        }

        if (r[0] === 'PROPERTIES') {
            attributes = []
            attrNames  = []
            nbFlatAttributes = -1
            for (let j = 1; j < r.length; ++j) {
                //attributes.push([])
                attrNames.push(r[j])
            }
            continue
        }

        if (r[0] === 'ESIZES') {
            attrSizes  = []
            for (let j = 1; j < r.length; ++j) {
                attrSizes.push( parseInt(r[j]) )
            }
            if (attrSizes.length !== attrNames.length) throw new Error(`size mismatch between PROPERTIES (${attrNames.length}) and ESIZES (${attrSizes.length})`)
            continue
        }

        if (r[0] === 'VRTX' || r[0] === 'PVRTX') {
            ++nbVertices

            positions.push(parseFloat(r[2]), parseFloat(r[3]), parseFloat(r[4]))

            // Initialize attributes and nbFlatAtributes
            if (nbFlatAttributes === -1) {
                if (attrSizes.length === 0) {
                    for (let i=0; i<attrNames.length; ++i) attrSizes[i] = 1
                }

                nbFlatAttributes = attrSizes.reduce( (acc, v) => acc+v, 0)
                attributes = new Array(nbFlatAttributes).fill(undefined).map( _ =>[] )
            }
            
            if (nbFlatAttributes !== r.length - 5) {
                throw new Error(`Wrong number of attributes for vertex. Should be ${nbFlatAttributes} and got ${r.length - 5}.\n Line: ${line}`)
            }
            
            for (let j = 0; j < nbFlatAttributes; ++j) {
                attributes[j].push(parseFloat(r[5 + j]))
            }
            continue
        }

        if (haveIndices && r[0] === keyword) {
            for (let i=0; i<dimension; ++i) {
                indices.push(parseInt(r[1+i], 10) - startIndex)
            }
            continue
        }
    }

    // Finish the last object if any
    const object = createObject({
        positions, indices, attrNames, attrSizes, attributes,
        itemSize: dimension, shared, name,
        className, extension, merge
    })
    if (object) objects.push( object )

    return objects
}

// ----------------------------------------------------

const arrayMax = (a: IArray) => a.reduce( (acc,cur) => cur>acc?cur:acc, 0)

function createObject(
    {positions, indices, attrNames, attrSizes, attributes, itemSize,shared, name, className, extension, merge}:
    {
        positions : number[],
        indices   : number[],
        attrNames : string[],
        attrSizes : number[],
        attributes: number[][],
        itemSize: number,
        name: string,
        className: string,
        shared: boolean,
        extension: string,
        merge: boolean
    }
): DataFrame
{
    if (positions.length===0) return undefined
    
    let df = new DataFrame(undefined, {
        className,
        extension,
        name,
        attributeNames: attrNames
    })

    df = append(df, {
        'positions': createSerie({data: createTyped(Float32Array, positions, shared), itemSize: 3})
    })

    if (indices !== undefined && indices.length !==0) {
        const max = arrayMax(indices)
        if (max>65535) {
            df = append(df, {
                'indices': createSerie({data: createTyped(Uint32Array, indices, shared), itemSize})
            })
        }
        else {
            df = append(df, {
                'indices': createSerie({data: createTyped(Uint16Array, indices, shared), itemSize})
            })
        }
    }

    // can merge only if all attribute are of size 1
    const canMerge = attrSizes.reduce( (acc, size) => acc && size===1, true )

    if (merge && canMerge) {
        const entries = new Map
        collapse(attrNames, attributes).forEach( attr => {
            entries.set( attr.name, createSerie({
                data: createTyped(Float32Array, attr.value, shared), 
                itemSize: attr.itemSize
            }) )
        })
        df = append(df, Object.fromEntries(entries))
    }
    else {
        // Otherwize, it is assumed that some ESIZES can be different that 1
        // Eah attributes[i] represente a scalar attribute for all vertices
        const entries = new Map
        let i = 0
        attrSizes.forEach( (size, k) => {
            const attrs = []
            for (let j=i; j<i+size; ++j) {
                attrs.push(attributes[j])
            }
            const attr = concatenate(attrs)
            entries.set(attrNames[k], createSerie({
                data: createTyped(Float32Array, attr, shared),
                itemSize: size
            }))
            i += size
        })

        // attrNames.forEach( (name, i) => {
        //     entries.set(name, createSerie({
        //         data: createTyped(Float32Array, attributes[i], shared),
        //         itemSize: attrSizes[i]
        //     }))
        // })
        df = append(df, Object.fromEntries(entries))
    }

    return df
}
