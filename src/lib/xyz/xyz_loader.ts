import { createSerie, createTyped, DataFrame, IArray } from "@youwol/dataframe"
import { collapse } from "../collapse"
import { trimAll } from "../utils"

/**
 * Format in order to know this is a cube:
 * ```text
 * # nx: 10
 * # ny: 10
 * # nz: 10
 * # x y z attr1 attr2 ...
 * 0 0 0  1 3
 * ...
 * ```
 * @example
 * ```ts
 * decodeXYZ(buffer)
 * decodeXYZ(buffer, {merge: false})
 * decodeXYZ(buffer, {merge: false, shared: false})
 * ```
 * @category XYZ
 */
export function decodeXYZ(
    buffer: string,
    {shared=true, merge=true}:{shared?: boolean, merge?: boolean}={}): DataFrame[]
{
    const dims      = [0, 0, 0]
    let className = 'Pointset'
    const extension = 'xyz'

    // /**
    //  * @erturns Array of objects which are define as:
    //  * <ul>
    //  * <li> for a cube    : `{mng: AttributeManager, className: string, min: [0,0,0], max: [0,0,0], dims: [0,0,0]}`
    //  * <li> for a pointset: `{mng: AttributeManager, className: string, min: [0,0,0], max: [0,0,0]}`
    //  * </ul>
    //  */
    let lines      = buffer.split('\n')
    let attributes: number[][] = []
    let attrNames: string[]      = []
    let positions: number[]      = []  
    let objects    = []
    let haveZ      = 0

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
    
            if (r.length > 3 && r[3] === 'z') {
                start++ ;
                haveZ = 1 ;
            }

            attributes = []
            attrNames      = []
            positions      = []
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
            attrNames = []
            positions = []

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
    
    let df  = undefined
    if (dims[0]===0 && dims[1]===0&&dims[2]===0) {
        df = new DataFrame({
            userData: {
                className,
                extension,
                attributeNames: attrNames
            }
        })
    }
    else {
        df = new DataFrame({
            userData: {
                className,
                dims,
                extension,
                attributeNames: attrNames
            }
        })
    }

    df = df.set('positions', createSerie(createTyped(Float64Array, positions, shared), 3))

    // const arrayMax = (a: IArray) => a.reduce( (acc,cur) => cur>acc?cur:acc, 0)
    // attrNames.forEach( (name, i) => {
    //     // For the moment, itemSize=1.
    //     // Have to collapse displ, srain and stress
    //     df = df.set(name, createSerie(createTyped(Float64Array, attributes[i], shared), 1))
    // })

    if (merge) {
        collapse(attrNames, attributes).forEach( attr => {
            df = df.set(attr.name, createSerie(createTyped(Float64Array, attr.value, shared), attr.itemSize))
        })
    }
    else {
        attrNames.forEach( (name, i) => {
            df = df.set(name, createSerie(createTyped(Float64Array, attributes[i], shared), 1))
        })
    }

    return df
}
