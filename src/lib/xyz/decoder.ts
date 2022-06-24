import { append, Serie, createTyped, DataFrame, IArray } from "@youwol/dataframe"
import { collapse } from "../collapse"
import { trimAll } from "../utils"

/**
 * Format in order to know this is a cube:
 * ```text
 * # nx: 10
 * # ny: 10
 * # nz: 10
 * # x y z a normal stress1
 * # sizes 1 3 6
 * 0 0 0  9  1 3 2  0 0 0 0 0 0
 * ...
 * ```
 * @example
 * ```ts
 * decodeXYZ(buffer)
 * decodeXYZ(buffer, {merge: false})
 * decodeXYZ(buffer, {merge: false, shared: false})
 * ```
 * @category Decoder
 */
export function decodeXYZ(
    buffer: string,
    {shared=true, merge=true}:{shared?: boolean, merge?: boolean}={}): DataFrame[]
{
    const dims      = [0, 0, 0]
    let className = 'Pointset'
    const extension = 'xyz'

    // /**
    //  * @return Array of objects which are define as:
    //  * <ul>
    //  * <li> for a cube    : `{mng: AttributeManager, className: string, min: [0,0,0], max: [0,0,0], dims: [0,0,0]}`
    //  * <li> for a pointset: `{mng: AttributeManager, className: string, min: [0,0,0], max: [0,0,0]}`
    //  * </ul>
    //  */
    let lines      = buffer.split('\n')
    let attributes: number[][] = []
    let attrNames : string[]   = []
    //let attrSizes : number[]   = []
    let positions : number[]   = []  
    let objects    = []
    let haveZ      = 1

    const impliciteName = 'ImpliciteCube'
    
    for (let i = 0; i < lines.length; ++i) {
        let line = trimAll(lines[i].trim())
        if (line.length === 0) {
                continue
        }

        let r = line.split(' ')
        if (r.length === 0) {
            continue
        }

        if (r[0] === '#') {
            let start = 3 // new pointset ?
            if (r.length < 2) {
                continue
            }

            if (r[1] === 'nx:') {
                dims[0] = parseInt(r[2], 10)
                className = 'Cube'
                continue
            }
            if (r[1] === 'ny:') {
                dims[1] = parseInt(r[2], 10)
                className = 'Cube'
                continue
            }
            if (r[1] === 'nz:') {
                dims[2] = parseInt(r[2], 10)
                className = 'Cube'
                continue
            }

            if (r[1] === 'CLASS') {
                className = r[4]
                const object = createObject({
                    dims, 
                    positions, 
                    attributes, 
                    attrNames, 
                    className,
                    shared,
                    extension,
                    merge
                })
                if (object) {
                    objects.push(object)
                }
                continue
            }

            if (r[1] !== 'x' && r[2] !== 'y') { // comment
                continue
            }

            if (r[1] === 'x' && r[2] === 'y' && r.length === 2) {
                haveZ = 0
                continue
            }

            // if (r[1] === 'sizes') {
            //     attrSizes  = []
            //     for (let j = 1; j < r.length; ++j) {
            //         attrSizes.push( parseInt(r[j]) )
            //     }
            //     if (attrSizes.length !== attrNames.length) {
            //         throw new Error(`sizes mismatch between property names (${attrNames.length}) and sizes (${attrSizes.length})`)
            //     }
            //     continue
            // }
    
            if (r.length > 3 && r[3] === 'z') {
                start++ ;
                haveZ = 1 ;
            }

            attributes = []
            attrNames  = []
            positions  = []
            for (let j = start; j < r.length; ++j) {
                attributes.push([])
                attrNames.push(r[j])
            }
            continue
        }

        if (r[0] === 'P') {
            haveZ = 1
            const object = createObject({
                dims, 
                positions, 
                attributes, 
                attrNames, 
                className,
                shared,
                extension,
                merge
            })
            if (object) {
                objects.push(object)
            }
            attributes = []
            attrNames  = []
            positions  = []

            for (let j = 1; j < r.length; ++j) {
                attributes.push([])
                attrNames.push(r[j])
            }
            continue
        }

        if (r.length >= (2 + haveZ)) { // min is (x,y)
            let x = parseFloat(r[0])
            let y = parseFloat(r[1])
            let z = haveZ ? parseFloat(r[2]) : 0
            positions.push(x, y, z)

            if (attributes.length !== r.length - (2 + haveZ)) {
                throw new Error(`Wrong number of attribute for vertex. Should be ${attributes.length} and got ${r.length - (2 + haveZ)}`)
            }
        
            for (let j = 0; j < attributes.length; ++j) {
                attributes[j].push( parseFloat(r[2 + haveZ + j]) )
            }
            continue
        }
    }
  
    const object = createObject({
        dims, 
        positions, 
        attributes, 
        attrNames, 
        className,
        shared,
        extension,
        merge
    })
    if (object) {
        objects.push(object)
    }

    return objects
}

function createObject(
    {dims, positions, attrNames, attributes, className, shared=true, extension, merge}:
    {
        dims : number[],
        positions : number[],
        attrNames : string[],
        attributes: number[][],
        className: string,
        shared?: boolean,
        extension: string,
        merge: boolean
    }
): DataFrame
{
    if (positions.length===0) return undefined
    
    let userData = {
        className,
        extension,
        attributeNames: attrNames
    }
    let posSerie = Serie.create({
        array: createTyped<Float32Array>(Float32Array, positions, shared),
        itemSize: 3
    })

    let df  = (dims[0]===0 && dims[1]===0&&dims[2]===0) 
        ?   DataFrame.create({
                series:{ positions: posSerie},
                userData
            })
        :   DataFrame.create({
            series:{ positions: posSerie},
            userData: {...userData, ...{dims} }
        })

    // const arrayMax = (a: IArray) => a.reduce( (acc,cur) => cur>acc?cur:acc, 0)
    // attrNames.forEach( (name, i) => {
    //     // For the moment, itemSize=1.
    //     // Have to collapse displ, srain and stress
    //     df = df.set(name, createSerie(createTyped(Float32Array, attributes[i], shared), 1))
    // })

    if (merge) {
        const entries = new Map
        collapse(attrNames, attributes).forEach( attr => {
            entries.set( attr.name, Serie.create({
                array: createTyped<Float32Array>(Float32Array, attr.value, shared), 
                itemSize: attr.itemSize
            }) )
        })
        df = append(df, Object.fromEntries(entries))

        // collapse(attrNames, attributes).forEach( attr => {
        //     df = df.set(attr.name, createSerie({
        //         data: createTyped(Float32Array, attr.value, shared),
        //         itemSize: attr.itemSize
        //     }))
        // })
    }
    else {
        const entries = new Map
        attrNames.forEach( (name, i) => {
            entries.set(name, Serie.create({
                array: createTyped<Float32Array>(Float32Array, attributes[i], shared),
                itemSize: 1
            }))
        })
        df = append(df, Object.fromEntries(entries))
        
        // attrNames.forEach( (name, i) => {
        //     df = df.set(name, createSerie({
        //         data: createTyped(Float32Array, attributes[i], shared),
        //         itemSize: 1
        //     }))
        // })
    }

    return df
}
