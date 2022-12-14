import { trimAll } from '../lib/utils'
// import { decodeGocadTS } from "../lib/gocad"
// import { info } from "@youwol/dataframe"
// import { dataS1 } from './S1'

test('decode Gocad S1', () => {
    const a = '  PROPERTIES	C	F	V	Z				        '
    const b = trimAll(a)
    expect(b).toBe('PROPERTIES C F V Z')

    //console.log('['+a+']')
    //console.log('['+b+']')
})
