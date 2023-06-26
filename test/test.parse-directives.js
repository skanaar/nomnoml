var nomnoml = require('../dist/nomnoml.js')
var { test } = require('node:test')
var { deepEqual } = require('./assert.js')
var { part, node, dir } = require('./utils.js')

test('single directive', () => {
  const input = '#dir'
  const expected = [dir('dir')]
  deepEqual(nomnoml.parse(input).directives, expected)
})

test('directive allowed chars', () => {
  const input = '#azAB09_: foo'
  const expected = [dir('azAB09_', 'foo')]
  deepEqual(nomnoml.parse(input).directives, expected)
})

test('do not throw on malformed directive', () => {
  const input = '##dir'
  deepEqual(nomnoml.parse(input).directives, [dir('#dir')])
})

test('directive and plain node', () => {
  const input = '#dir\n\n[a]'
  const expectedRoot = part({ nodes: [node('a')] })
  const expectedDirs = [dir('dir')]
  deepEqual(nomnoml.parse(input).root, expectedRoot)
  deepEqual(nomnoml.parse(input).directives, expectedDirs)
})

test('plain node and directive', () => {
  const input = '[a]\n#dir'
  const expectedRoot = part({ nodes: [node('a')] })
  const expectedDirs = [dir('dir')]
  deepEqual(nomnoml.parse(input).root, expectedRoot)
  deepEqual(nomnoml.parse(input).directives, expectedDirs)
})

test('nested nodes with directive inside', () => {
  const input = '[a\n#dir\n]'
  const expectedRoot = part({ nodes: [node('a')] })
  const expectedDirs = [dir('dir')]
  deepEqual(nomnoml.parse(input).root, expectedRoot)
  deepEqual(nomnoml.parse(input).directives, expectedDirs)
})

test('text line and directive', () => {
  const input = 'a\n#dir'
  const expectedRoot = part({ lines: ['a'] })
  const expectedDirs = [dir('dir')]
  deepEqual(nomnoml.parse(input).root, expectedRoot)
  deepEqual(nomnoml.parse(input).directives, expectedDirs)
})

test('key-value directive', () => {
  const input = '#foo:bar 123 #baz [<weird>stuff]'
  const { root, directives } = nomnoml.parse(input)
  deepEqual(root, part({}))
  deepEqual(directives, [dir('foo', 'bar 123 #baz [<weird>stuff]')])
})

test('trim whitespace of key-value directive', () => {
  const input = '#foo:  bar 123 #baz'
  const expected = [dir('foo', 'bar 123 #baz')]
  deepEqual(nomnoml.parse(input).directives, expected)
})

test('directive must start a line', () => {
  const input = '[#foo]'
  const expected = part({ nodes: [node('#foo')] })
  deepEqual(nomnoml.parse(input).root, expected)
})

test('known visual in custom style', () => {
  nomnoml.renderSvg('#.box: visual=class\n[<box>box]')
})

test('unknown visual in custom style', () => {
  nomnoml.renderSvg('#.box: visual=finnsinte\n[<box>box]')
})
