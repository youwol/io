```ts
import { decodeGocadTS } from '@youwol/io'
import { info } from '@youwol/dataframe'

const buffer = `GOCAD TSurf 1
HEADER {
  name: test
}
PROPERTIES a
PVRTX 0 0 0 0 1
PVRTX 1 1 0 0 4
PVRTX 2 0 1 0 9
TRGL 0 1 2
END`

const objects = decodeGocadTS(buffer) // as DataFrame[]
objects.forEach((df) => {
    console.log(info(df))
    console.log('nb nodes     :', df.get('position').count)
    console.log('nb triangles :', df.get('indices').count)
    console.log('nb attributes:', df.series.length - 2)
})
```
