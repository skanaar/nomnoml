var { parse, ParseError } = require('../dist/nomnoml.js')
var { test } = require('node:test')
var { deepEqual, assert } = require('./assert.js')
var { part, node } = require('./utils.js')

test('choose longest definition of nodes defined twice', () => {
  const input = '[a]\n[a|foo]'
  const expected = part({
    nodes: [node('a', { parts: [part({ lines: ['a'] }), part({ lines: ['foo'] })] })],
  })
  deepEqual(parse(input).root, expected)
})

test('empty source code', function () {
  const expected = part({})
  deepEqual(parse(' \n\t ').root, expected)
})

test('leading whitespace', function () {
  deepEqual(parse('\n[a]').root, part({ nodes: [node('a')] }))
})
test('trailing whitespace', function () {
  deepEqual(parse('[a]\n').root, part({ nodes: [node('a')] }))
})
test('leading and trailing whitespace', function () {
  deepEqual(parse(' \n [a] \n ').root, part({ nodes: [node('a')] }))
})
test('node trailing whitespace', function () {
  deepEqual(parse('[a \n]').root, part({ nodes: [node('a')] }))
})
test('node leading whitespace', function () {
  deepEqual(parse('[\n a]').root, part({ nodes: [node('a')] }))
})
test('node leading and trailing whitespace', function () {
  deepEqual(parse('[\n a \n]').root, part({ nodes: [node('a')] }))
})

test('parse errors are reported on correct line', function () {
  try {
    parse('\n\n[a][b]')
  } catch (e) {
    deepEqual(e.line, 3)
    return
  }
  throw new Error('parse() must throw error')
})

function perfTest(n) {
  const start = performance.now()
  parse('[a|'.repeat(n) + ']'.repeat(n))
  return performance.now() - start
}

test('performance', () => {
  for (let n = 1; n < 4; n++) console.log(n, perfTest(n).toFixed(1), 'ms')
})

test('require single node to be closed', () => {
  assert(() => parse('[a'), 'throws', ParseError)
})

test('require closed nodes', () => {
  assert(() => parse('[a\n[b]'), 'throws', ParseError)
})

test('incomplete diagram', () => {
  assert(() => parse('[a|[b]'), 'throws', ParseError)
})

test('extra closing brackets', () => {
  assert(() => parse('[a]]'), 'throws', ParseError)
})
