```ts
const df   = require('@youwol/dataframe')
const io   = require('@youwol/io')
const fs   = require('fs')

// load
const dfs = io.decodeGocadTS( fs.readFileSync('./file.gcd', 'utf8') )

// save
fs.writeFile('output.gcd', io.encodeGocadTS(dfs), 'utf8', err => {})
```