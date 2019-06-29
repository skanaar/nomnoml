var fs = require('fs')
var typicons = require('./typicons.js')
var html = fs.readFileSync('./index.html', { encoding: 'utf8' })
var iconTemplate = fs.readFileSync('./build/icon.vue.ts.template', { encoding: 'utf8' })

var references = html.match(/<icon id=([^ >]*)/g).map(e => e.substr('<icon id='.length))
var iconObj = {}
references.forEach(it => iconObj[it] = typicons[it])
var iconComponentSource = iconTemplate.replace('/*{{body}}*/', JSON.stringify(iconObj, null, 2))
fs.writeFileSync('./webapp/icon.vue.ts', iconComponentSource)