var nomnoml = require('../dist/nomnoml.js')
var { test } = require('node:test')
var { deepEqual, assert } = require('./assert.js')
var { part, node, assoc } = require('./utils.js')

test('plain node relation', () => {
  const input = '[a]-[b]'
  const expected = part({
    nodes: [node('a'), node('b')],
    assocs: [assoc('a', '-', 'b')],
  })
  deepEqual(nomnoml.parse(input).root, expected)
})

test('explicit id node relation', () => {
  const input = '[<class id=foo>a]\n[foo]-[b]'
  const expected = part({
    nodes: [
      node('foo', {
        type: 'class',
        parts: [part({ lines: ['a'] })],
        attr: { id: 'foo' },
      }),
      node('b'),
    ],
    assocs: [assoc('foo', '-', 'b')],
  })
  const output = nomnoml.parse(input).root
  deepEqual(output, expected)
})

test('3 node chain', () => {
  const input = '[a]-[b]-[c]'
  const expected = part({
    nodes: [node('a'), node('b'), node('c')],
    assocs: [assoc('a', '-', 'b'), assoc('b', '-', 'c')],
  })
  deepEqual(nomnoml.parse(input).root, expected)
})

test('self reference', () => {
  const input = '[a]-[a]'
  const expected = part({
    nodes: [node('a')],
    assocs: [assoc('a', '-', 'a')],
  })
  deepEqual(nomnoml.parse(input).root, expected)
})

test('multiple self reference', () => {
  const input = '[a]-[a]\n[a]-[a]'
  const expected = part({
    nodes: [node('a')],
    assocs: [assoc('a', '-', 'a'), assoc('a', '-', 'a')],
  })
  deepEqual(nomnoml.parse(input).root, expected)
})

test('render multiple relations', () => {
  nomnoml.renderSvg('[a]-[b]\n[a]-[b]')
})

test('multiple relations', () => {
  const input = '[a]-[b]\n[b]-[c]'
  const expected = part({
    nodes: [node('a'), node('b'), node('c')],
    assocs: [assoc('a', '-', 'b'), assoc('b', '-', 'c')],
  })
  deepEqual(nomnoml.parse(input).root, expected)
})

test('independent relations when nested', () => {
  const input = '[a|[a]-[b]]-[b]'
  const expected = part({
    nodes: [
      node('a', {
        parts: [
          part({ lines: ['a'] }),
          part({
            nodes: [node('a'), node('b')],
            assocs: [assoc('a', '-', 'b')],
          }),
        ],
      }),
      node('b'),
    ],
    assocs: [assoc('a', '-', 'b')],
  })
  deepEqual(nomnoml.parse(input).root, expected)
})

const relations = [
  '-',
  '--',
  '->',
  '<-',
  '-:>',
  '<:-',
  '-+',
  '+-',
  '-o',
  'o-',
  '-o)',
  '(o-',
  'o<-)',
  '(->o',
  '-/-',
]

for (const rel of relations) {
  test(`relation [a]${rel}[b]`, () => {
    const input = `[a]${rel}[b]`
    const expected = part({
      nodes: [node('a'), node('b')],
      assocs: [assoc('a', rel, 'b')],
    })
    deepEqual(nomnoml.parse(input).root, expected)
  })

  test(`relation [a] x ${rel} y [b]`, () => {
    const input = `[a] x ${rel} y [b]`
    const expected = part({
      nodes: [node('a'), node('b')],
      assocs: [
        assoc('a', rel, 'b', {
          startLabel: { text: 'x' },
          endLabel: { text: 'y' },
        }),
      ],
    })
    deepEqual(nomnoml.parse(input).root, expected)
  })
}

test('start-labelled relation', () => {
  const input = '[a]xyz-[b]'
  const expected = part({
    nodes: [node('a'), node('b')],
    assocs: [assoc('a', '-', 'b', { startLabel: { text: 'xyz' } })],
  })
  deepEqual(nomnoml.parse(input).root, expected)
})

test('start-labelled relation with the letter o', () => {
  const input = '[a]no -[b]'
  const expected = part({
    nodes: [node('a'), node('b')],
    assocs: [assoc('a', '-', 'b', { startLabel: { text: 'no' } })],
  })
  deepEqual(nomnoml.parse(input).root, expected)
})

test('end-labelled relation', () => {
  const input = '[a]-xyz[b]'
  const expected = part({
    nodes: [node('a'), node('b')],
    assocs: [assoc('a', '-', 'b', { endLabel: { text: 'xyz' } })],
  })
  deepEqual(nomnoml.parse(input).root, expected)
})

test('to labelled separated relation', () => {
  const input = '[a]f -[b]'
  const expected = part({
    nodes: [node('a'), node('b')],
    assocs: [assoc('a', '-', 'b', { startLabel: { text: 'f' } })],
  })
  deepEqual(nomnoml.parse(input).root, expected)
})

test('to labelled relation with escaped chars', () => {
  const input = '[a]a\\-a\\[a -[b]'
  const expected = part({
    nodes: [node('a'), node('b')],
    assocs: [assoc('a', '-', 'b', { startLabel: { text: 'a-a[a' } })],
  })
  deepEqual(nomnoml.parse(input).root, expected)
})

test('labelled relation and 0..* label', () => {
  const input = '[a] -o 0..*[b]'
  const expected = part({
    nodes: [node('a'), node('b')],
    assocs: [assoc('a', '-o', 'b', { endLabel: { text: '0..*' } })],
  })
  deepEqual(nomnoml.parse(input).root, expected)
})

test(`end labelled relation`, () => {
  const inputs = [
    '[a]-no[b]',
    '[a] -no[b]',
    '[a]- no[b]',
    '[a] - no[b]',
    '[a]-no [b]',
    '[a] -no [b]',
    '[a]- no [b]',
    '[a] - no [b]',
  ]
  const expected = part({
    nodes: [node('a'), node('b')],
    assocs: [assoc('a', '-', 'b', { endLabel: { text: 'no' } })],
  })
  for (const input of inputs) deepEqual(nomnoml.parse(input).root, expected)
})

test(`start labelled relation`, () => {
  const inputs = [
    '[a]on-[b]',
    '[a]on -[b]',
    '[a]on- [b]',
    '[a]on - [b]',
    '[a] on-[b]',
    '[a] on -[b]',
    '[a] on- [b]',
    '[a] on - [b]',
  ]
  const expected = part({
    nodes: [node('a'), node('b')],
    assocs: [assoc('a', '-', 'b', { startLabel: { text: 'on' } })],
  })
  for (const input of inputs) deepEqual(nomnoml.parse(input).root, expected)
})

test('cycle [a]->[b]->[a]', () => {
  const input = '[a]->[b]->[a]'
  const expected = part({
    nodes: [node('a'), node('b')],
    assocs: [assoc('a', '->', 'b', {}), assoc('b', '->', 'a', {})],
  })
  deepEqual(nomnoml.parse(input).root, expected)
})

test('line break in node name [foo;bar]', () => {
  const input = '[foo;bar]'
  const expected = part({
    nodes: [node('foo', { parts: [part({ lines: ['foo', 'bar'] })] })],
  })
  deepEqual(nomnoml.parse(input).root, expected)
})

test('multiple equivalent associations [a]->[b];[a]->[b]', () => {
  const input = '[a]->[b];[a]->[b]'
  const expected = part({
    nodes: [node('a'), node('b')],
    assocs: [assoc('a', '->', 'b', {}), assoc('a', '->', 'b', {})],
  })
  deepEqual(nomnoml.parse(input).root, expected)
})

test('empty partition [foo|]', () => {
  const input = '[foo|]'
  const expected = part({
    nodes: [node('foo', { parts: [part({ lines: ['foo'] }), part({})] })],
  })
  deepEqual(nomnoml.parse(input).root, expected)
})

test('table [<table>table|foo|bar||x|y]', () => {
  const input = '[<table>table|foo|bar||x|y]'
  const expected = part({
    nodes: [
      node('table', {
        type: 'table',
        parts: [
          part({ lines: ['table'] }),
          part({ lines: ['foo'] }),
          part({ lines: ['bar'] }),
          part({}),
          part({ lines: ['x'] }),
          part({ lines: ['y'] }),
        ],
      }),
    ],
  })
  deepEqual(nomnoml.parse(input).root, expected)
})
