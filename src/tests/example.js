const io =require('../../dist/@youwol/io')
const df =require('../../../dataframe/dist/@youwol/dataframe')

const bufferTs =
`GOCAD TSurf 1
HEADER {
  name:salt
}
PROPERTIES a
TFACE
PVRTX 0 0 0 0 1
PVRTX 1 1 0 0 4
PVRTX 2 0 1 0 9
TRGL 0 1 2
END`

const ts = io.decodeGocadTS(bufferTs)[0]
console.log( df.info(ts) )
console.log( ts.get('positions').count )
console.log( ts.get('indices').count )
console.log( ts.get('a').count )

const sol_a = [1,4,9]
const a = ts.get('a')
a.forEachItem( (v,i) => console.assert(v === sol_a[i]) )

const p = ts.get('positions')
p.forEachItem( (v,i) => console.log(v) )
