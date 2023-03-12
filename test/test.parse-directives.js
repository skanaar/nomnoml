var nomnoml = require('../dist/nomnoml.js')
var { test } = require('node:test')
var { deepEqual } = require('./assert.js')

test('single directive', () => {
  const input = '#dir'
  const expected = part({ directives: [dir('dir')] })
  deepEqual(nomnoml.parse(input).root, expected)
})

test('directive and plain node', () => {
  const input = '#dir\n\n[a]'
  const expected = part({ nodes: [node('a')], directives: [dir('dir')] })
  deepEqual(nomnoml.parse(input).root, expected)
})

test('plain node and directive', () => {
  const input = '[a]\n#dir'
  const expected = part({ nodes: [node('a')], directives: [dir('dir')] })
  deepEqual(nomnoml.parse(input).root, expected)
})

test('text line and directive', () => {
  const input = 'a\n#dir'
  const expected = part({ lines: ['a'], directives: [dir('dir')] })
  deepEqual(nomnoml.parse(input).root, expected)
})

test('key-value directive', () => {
  const input = '#foo:bar 123 #baz'
  const expected = part({
    lines: [],
    directives: [dir('foo', 'bar 123 #baz')],
  })
  deepEqual(nomnoml.parse(input).root, expected)
})

test('trim whitespace of key-value directive', () => {
  const input = '#foo:  bar 123 #baz'
  const expected = part({
    lines: [],
    directives: [dir('foo', 'bar 123 #baz')],
  })
  deepEqual(nomnoml.parse(input).root, expected)
})

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

test('known visual in custom style', () => {
  nomnoml.renderSvg('#.box: visual=class\n[<box>box]')
})

test('unknown visual in custom style', () => {
  nomnoml.renderSvg('#.box: visual=finnsinte\n[<box>box]')
})

function dir(key, value = '') {
  return { key, value }
}

function node(id, template = {}) {
  return {
    id,
    type: 'class',
    parts: [part({ lines: [id] })],
    attr: {},
    ...template,
  }
}

function part(template) {
  return {
    nodes: [],
    assocs: [],
    lines: [],
    directives: [],
    ...template,
  }
}
