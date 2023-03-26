var nomnoml = require('../dist/nomnoml.js')
var { test } = require('node:test')
var { deepEqual } = require('./assert.js')
var { part, node } = require('./utils.js')

test('commented code', () => {
  const input = `[a]
//[foo]
[b]`
  const expected = part({ nodes: [node('a'), node('b')] })
  deepEqual(nomnoml.parse(input).root, expected)
})

test('multiple comments code', () => {
  const input = `[a]
//[foo]
// apa
[b]
//xyz
`
  const expected = part({ nodes: [node('a'), node('b')] })
  deepEqual(nomnoml.parse(input).root, expected)
})

test('trailing comments', () => {
  const input = `[a]
[b] // [foo]`
  const expected = part({ nodes: [node('a'), node('b')] })
  deepEqual(nomnoml.parse(input).root, expected)
})
