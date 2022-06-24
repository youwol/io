import { DataFrame } from "@youwol/dataframe"
import { encodeUserData } from "../utils"

/**
 * @category Encoder
 */
export function encodeSTL(dfs: DataFrame[] | DataFrame, {binary=false}:{binary?:boolean}={}): string {
    let buffer = ''
    console.warn('TODO: STL encoder for meshes')
    return buffer
}
