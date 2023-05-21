var nomnoml = require('../dist/nomnoml.js')
var { test } = require('node:test')
var { deepEqual } = require('./assert.js')
var { part, node, assoc } = require('./utils.js')

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

test('trailing comments are not supported', () => {
  const input = `[a]
[b] // -> [foo]`
  const expected = part({
    nodes: [node('a'), node('b'), node('foo')],
    assocs: [assoc('b', '->', 'foo', { startLabel: { text: '//' } })],
  })
  const actual = nomnoml.parse(input).root
  deepEqual(actual, expected)
})
