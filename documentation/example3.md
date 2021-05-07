```ts
const df   = require('@youwol/dataframe')
const io   = require('@youwol/io')
const fs   = require('fs')

io.decodeGocadTS( fs.readFileSync('./input.gcd', 'utf8') ).forEach( (df, i) => {
	let n = 0
	df.series.forEach( info => {
		if (info.serie.name !== 'positions' && info.serie.name !== 'indices') ++n
	})
	console.log( "Surface", i+1 )
	console.log( "  - vertices  : count =", df.get('positions').count )
	console.log( "  - faces     : count =", df.get('indices').count )
	console.log( "  - attributes: count =", n)
	df.series.forEach( info => {
		if (info.serie.name !== 'positions' && info.serie.name !== 'indices') {
			console.log(
				`    -  ${info.serie.name}  :`,
				'itemSize =', info.serie.itemSize, 'count =', info.serie.count
			)
		}
	})
})
```