var { parse } = require('../dist/nomnoml.js')
var { test } = require('node:test')
var { readdirSync, readFileSync, existsSync, lstatSync } = require('node:fs')

test('parse all sample sources', () => {
  if (!existsSync('../../nomnoml-samples')) return
  for (const file of listRecursive('../../nomnoml-samples', '.txt')) {
    const input = readFileSync(file, 'utf8')
    try {
      parse(input)
    } catch (e) {
      throw new Error('failed to parse: ' + file + '\n' + e.message, { cause: e })
    }
  }
})

function* listRecursive(folder, suffix = '') {
  const entries = readdirSync(folder)
  for (const entry of entries) {
    if (lstatSync(folder + '/' + entry).isDirectory()) {
      yield* listRecursive(folder + '/' + entry, suffix)
    }
    if (entry.endsWith(suffix)) yield folder + '/' + entry
  }
}
