/**
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
 * @category Utils
 */
export function encodeUserData(userData: { [key: string]: object }): string {
    let s = ''
    if (userData !== undefined) {
        s += '\n# BEGIN USERDATA\n'
        for (const [key, value] of Object.entries(userData)) {
            s += `#   ${key} ${value}\n`
        }
        s += '# END USERDATA\n\n'
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
