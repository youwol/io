import { trimAll, decodeGocadTS } from "../lib"
import { info } from "@youwol/dataframe"
import { dataS1 } from './S1'

test('test decode Gocad S1', () => {
    const a = '  PROPERTIES	C	F	V	Z				        '
    const b = trimAll(a)
    expect(b).toEqual('PROPERTIES C F V Z')
    
    //console.log('['+a+']')
    //console.log('['+b+']')
})