import { info } from "@youwol/dataframe"
import { decodeXYZ } from "../lib"

const buffer1 =
`# x y z a
0 0 0 1
1 0 0 4
0 1 0 9
`

test('test decode simple xyz', () => {
    const tss = decodeXYZ(buffer1)
    expect(tss.length).toEqual(1)

    const ts = tss[0]
    //console.log( info(ts) )

    expect(ts.get('positions')).toBeDefined()
    expect(ts.get('positions').count).toEqual(3)
    expect(ts.get('indices')).toBeUndefined()
    expect(ts.get('a').count).toEqual(3)
    
    {
        const sa = [1,4,9]
        const a = ts.get('a')
        a.forEachItem( (v,i) => expect(v).toEqual(sa[i]) )
    }

    {
        const sa = [[0,0,0], [1,0,0], [0,1,0]]
        const a = ts.get('positions')
        a.forEachItem( (v,i) => expect(v).toEqual(sa[i]) )
    }
})

const buffer2 = `# nx: 2
# ny: 2
# nz: 1
# x y z a
0 0 0 1
1 0 0 4
0 1 0 9
0 1 1 16
`

test('test decode xyz implicite', () => {
    const tss = decodeXYZ(buffer2)
    expect(tss.length).toEqual(1)

    const ts = tss[0]
    //console.log( info(ts) )
    
    expect(ts.get('positions')).toBeDefined()
    expect(ts.get('positions').count).toEqual(4)
    expect(ts.get('indices')).toBeUndefined()
    expect(ts.get('a').count).toEqual(4)
    
    {
        const sa = [1,4,9,16]
        const a = ts.get('a')
        a.forEachItem( (v,i) => expect(v).toEqual(sa[i]) )
    }

    {
        const sa = [[0,0,0], [1,0,0], [0,1,0], [0,1,1]]
        const a = ts.get('positions')
        a.forEachItem( (v,i) => expect(v).toEqual(sa[i]) )
    }
})
