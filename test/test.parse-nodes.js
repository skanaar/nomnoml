var nomnoml = require('../dist/nomnoml.js')
var { test } = require('node:test')
var { deepEqual } = require('./assert.js')
var { part, node, assoc } = require('./utils.js')

test('single plain node', () => {
  const input = '[a]'
  const expected = part({ nodes: [node('a')] })
  deepEqual(nomnoml.parse(input).root, expected)
})

test('two plain nodes', () => {
  const input = '[a]\n[b]'
  const expected = part({ nodes: [node('a'), node('b')] })
  deepEqual(nomnoml.parse(input).root, expected)
})

test('use any character in nodes', () => {
  const input = '[\\|a]'
  const expected = part({ nodes: [node('|a')] })
  deepEqual(nomnoml.parse(input).root, expected)
})
test('use backslash in nodes', () => {
  const input = '[\\\\a]'
  const expected = part({ nodes: [node('\\a')] })
  deepEqual(nomnoml.parse(input).root, expected)
})

test('escaped character in node name', () => {
  const input = '[&ü🐵漢]'
  const expected = part({ nodes: [node('&ü🐵漢')] })
  deepEqual(nomnoml.parse(input).root, expected)
})

test('typed node', () => {
  const input = '[<x>a]'
  const expected = part({ nodes: [node('a', { type: 'x' })] })
  deepEqual(nomnoml.parse(input).root, expected)
})

test('typed node allowed chars', () => {
  const input = '[<a0X_a>a]'
  const expected = part({ nodes: [node('a', { type: 'a0X_a' })] })
  deepEqual(nomnoml.parse(input).root, expected)
})

test('angle brackets allowed in text position', () => {
  const input = '[a<b]'
  const expected = part({ nodes: [node('a<b', {})] })
  deepEqual(nomnoml.parse(input).root, expected)
})

test('attributed node', () => {
  const input = '[<class meta=x>a]'
  const expected = part({
    nodes: [node('a', { type: 'class', attr: { meta: 'x' } })],
  })
  deepEqual(nomnoml.parse(input).root, expected)
})

test('attributed node allowed chars', () => {
  const input = '[<class a0A_x=x>a]'
  const expected = part({
    nodes: [node('a', { type: 'class', attr: { a0A_x: 'x' } })],
  })
  deepEqual(nomnoml.parse(input).root, expected)
})

test('id attributed node', () => {
  const input = '[<class id=foo>a]'
  const expected = part({
    nodes: [
      node('foo', {
        type: 'class',
        parts: [part({ lines: ['a'] })],
        attr: { id: 'foo' },
      }),
    ],
  })
  deepEqual(nomnoml.parse(input).root, expected)
})

test('node with compartments', () => {
  const input = '[a|foo|bar]'
  const expected = part({
    nodes: [
      node('a', {
        parts: [part({ lines: ['a'] }), part({ lines: ['foo'] }), part({ lines: ['bar'] })],
      }),
    ],
  })
  deepEqual(nomnoml.parse(input).root, expected)
})

test('node with compartments trim text', () => {
  const input = '[a| foo | bar ]'
  const expected = part({
    nodes: [
      node('a', {
        parts: [part({ lines: ['a'] }), part({ lines: ['foo'] }), part({ lines: ['bar'] })],
      }),
    ],
  })
  deepEqual(nomnoml.parse(input).root, expected)
})

test('node with compartments with escaped chars', () => {
  const input = '[a|f\\[\\]\\|]'
  const expected = part({
    nodes: [
      node('a', {
        parts: [part({ lines: ['a'] }), part({ lines: ['f[]|'] })],
      }),
    ],
  })
  deepEqual(nomnoml.parse(input).root, expected)
})

test('line breaks in compartement', () => {
  const input = '[a|foo;bar|baz\nqux]'
  const expected = part({
    nodes: [
      node('a', {
        parts: [
          part({ lines: ['a'] }),
          part({ lines: ['foo', 'bar'] }),
          part({ lines: ['baz', 'qux'] }),
        ],
      }),
    ],
  })
  deepEqual(nomnoml.parse(input).root, expected)
})

const expected = part({
  nodes: [node('a', { parts: [part({ lines: ['a', 'b'] })] })],
})
test('line break in node name', () => {
  deepEqual(nomnoml.parse('[a\nb]').root, expected)
})
test('line separator in node name', () => {
  deepEqual(nomnoml.parse('[a;b]').root, expected)
})
test('line separator and break in node name', () => {
  deepEqual(nomnoml.parse('[a\n; b]').root, expected)
})

test('indented compartements', () => {
  const input = `[a
  |
  foo;bar
  |
  baz
  qux|
  zuz
]`
  const expected = part({
    nodes: [
      node('a', {
        parts: [
          part({ lines: ['a'] }),
          part({ lines: ['foo', 'bar'] }),
          part({ lines: ['baz', 'qux'] }),
          part({ lines: ['zuz'] }),
        ],
      }),
    ],
  })
  deepEqual(nomnoml.parse(input).root, expected)
})

test('omit trailing newlines', () => {
  const input = '[a\n\n|b]'
  const expected = part({
    nodes: [
      node('a', {
        parts: [part({ lines: ['a'] }), part({ lines: ['b'] })],
      }),
    ],
  })
  deepEqual(nomnoml.parse(input).root, expected)
})

test('omit trailing newlines even if they have whitespace', () => {
  const input = '[a\n  |b]'
  const expected = part({
    nodes: [
      node('a', {
        parts: [part({ lines: ['a'] }), part({ lines: ['b'] })],
      }),
    ],
  })
  deepEqual(nomnoml.parse(input).root, expected)
})

test('nested nodes', () => {
  const input = `[a|[foo]]`
  const expected = part({
    nodes: [
      node('a', {
        parts: [part({ lines: ['a'] }), part({ nodes: [node('foo')] })],
      }),
    ],
  })
  deepEqual(nomnoml.parse(input).root, expected)
})

test('nested nodes with relations', () => {
  const input = `#background:blue

  [Pirate|
    [a]--[b]
    [a]-:>[c]
  ]`
  const expected = part({
    nodes: [
      node('Pirate', {
        parts: [
          part({ lines: ['Pirate'] }),
          part({
            nodes: [node('a'), node('b'), node('c')],
            assocs: [assoc('a', '--', 'b'), assoc('a', '-:>', 'c')],
          }),
        ],
      }),
    ],
  })
  const { root, directives } = nomnoml.parse(input)
  deepEqual(root, expected)
  deepEqual(directives, [{ key: 'background', value: 'blue' }])
})
