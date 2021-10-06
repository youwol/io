export function trimAll(s: string) {
    return s.replace(/\s+/g, ' ').replace(/^\s+|\s+$/, '').replace('\t', ' ').trimEnd()
}

export function encodeUserData(userData: {[key:string]: any}): string {
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