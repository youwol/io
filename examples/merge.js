const io     = require('../dist/@youwol/io')
const fs     = require('fs')

// const names = [
//     '/data/arch/galapagos-all/model2/dikes_georef/line.pl/Alcedo_Concentric_dikes_georef_good.pl',
//     '/data/arch/galapagos-all/model2/dikes_georef/line.pl/Ecuador_radial_dikes_georef_good.pl',
//     '/data/arch/galapagos-all/model2/dikes_georef/line.pl/Alcedo_Radial_dikes_georef_good.pl',
//     '/data/arch/galapagos-all/model2/dikes_georef/line.pl/Fernandina_concentric_dikes_georef_good.pl',
//     '/data/arch/galapagos-all/model2/dikes_georef/line.pl/Cerro_azul_Concentric_dikes_georef_good.pl',
//     '/data/arch/galapagos-all/model2/dikes_georef/line.pl/Fernandina_radial_dikes_georef_good.pl',
//     '/data/arch/galapagos-all/model2/dikes_georef/line.pl/Cerro_azul_Radial_dikes_georef_good.pl',
//     '/data/arch/galapagos-all/model2/dikes_georef/line.pl/Sierra_Negra_concentric_fault_georef_good.pl',
//     '/data/arch/galapagos-all/model2/dikes_georef/line.pl/Darwin_concentric_dikes_georef_good.pl',
//     '/data/arch/galapagos-all/model2/dikes_georef/line.pl/Sierra_Negra_radial_fault_georef_good.pl',
//     '/data/arch/galapagos-all/model2/dikes_georef/line.pl/Darwin_radial_dikes_georef_good.pl',
//     '/data/arch/galapagos-all/model2/dikes_georef/line.pl/Wolf_concentric_dikes_georef_good.pl',
//     '/data/arch/galapagos-all/model2/dikes_georef/line.pl/Ecuador_concentric_dikes_georef_good.pl',
//     '/data/arch/galapagos-all/model2/dikes_georef/line.pl/Wolf_radial_dikes_georef_good.pl'
// ]

// let allLines = []
// names.forEach( name => {
//     const lines = io.decodeGocadPL( fs.readFileSync('/Users/fmaerten' + name, 'utf8') )
//     allLines = [...allLines, ...lines]
// })
// fs.writeFileSync('/Users/fmaerten/tmp/galapagos/all-dykes.pl', io.encodeGocadPL(allLines), 'utf8', err => {})


const filename = '/Users/fmaerten/data/arch/galapagos-all/model2/simulations-grid-stress-6700.ts'
const surfaces = io.decodeGocadTS( fs.readFileSync(filename, 'utf8') )
const surface = io.merge(surfaces)
console.log(surface)


fs.writeFileSync('/Users/fmaerten/data/arch/galapagos-all/model2/simulations-grid-stress-6700-merged.ts', io.encodeGocadTS(surface), 'utf8', err => {})




// const map = new Map()
// surfaces.forEach( surface => {
//     for (const [name, serie] of Object.entries(surface.series)) {
//         if (name[name] === undefined) map.set(name, 0)
//         map.set(name, serie.count + map.get(name))
//     }
// })
