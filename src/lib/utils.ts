/**
 * Get the extension of a filename
 * @example
 * ```js
 * const e = getExtension('myfile.ts') // return 'ts'
 * ```
 *
 * @category Utils
 */
export function getExtension(filename: string) {
    return filename.substring(filename.lastIndexOf('.') + 1)
}

/**
 * Extract the filename from a full path. The extension is included in the result.
 * @param fullPath The full path of the filename, e.g., `../../A/B/toto.xyz` will return `toto.xyz`
 * @example
 * ```ts
 * const f = '../../A/B/toto.xyz'
 * const name = getBaseName( getFilename(f) )
 * console.log(name) // toto
 * ```
 * 
 * @category Utils
 */
export function getFilename(fullPath: string) {
    return fullPath.replace(/^.*[\\\/]/, '')
}

/**
 * Get the base name of a filename, i.e., the name without the extension
 * @example
 * ```js
 * const e = getExtension('myfile.ts') // return 'myfile'
 * ```
 *
 * @category Utils
 */
export function getBaseName(filename: string) {
    return filename.substring(0, filename.lastIndexOf('.'))
}

/**
 * Remove all duplicated spaces and tabs as well as all
 * beginning and ending spaces and tabs.
 * @category Utils
 */
export function trimAll(s: string) {
    return s
        .replace(/\s+/g, ' ')
        .replace(/^\s+|\s+$/, '')
        .replace('\t', ' ')
        .trimEnd()
}

/**
 * Encode the user data as comments for a specific filter. Default comment tag is `#`.
 * @category Utils
 */
export function encodeUserData(userData: { [key: string]: object }, commentChar = '#'): string {
    let s = ''
    if (userData !== undefined) {
        s += `\n${commentChar} BEGIN USERDATA\n`
        for (const [key, value] of Object.entries(userData)) {
            s += `${commentChar}   ${key} ${value}\n`
        }
        s += `${commentChar} END USERDATA\n\n`
    }
    return s
}

/**
 * Approximate a number by removing digits if necessary.
 * @param a The number ot approximate
 * @param deci The maximum number of digits (default is 8)
 * @returns The string version of the approximate number
 */
export function approxNumber(a: number, deci = 8): string {
    const b = Math.round(Math.log(a) / L10)
    return a.toFixed(deci - b < 0 ? 0 : deci - b)
}

const L10 = Math.log(10)
