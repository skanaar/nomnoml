var nomnoml = require('../dist/nomnoml.js')
var TestSuite = require('./TestSuite.js')

var suite = TestSuite('Parse nodes')
var assertEqual = TestSuite.assertEqual

suite.test('single plain node', () => {
  const input = '[a]'
  const expected = part({ nodes: [node('a')] })
  assertEqual(nomnoml.parse(input).root, expected)
})

suite.test('use any character in nodes', () => {
  const input = '[\\|a]'
  const expected = part({ nodes: [node('|a')] })
  assertEqual(nomnoml.parse(input).root, expected)
})
suite.test('use backslash in nodes', () => {
  const input = '[\\\\a]'
  const expected = part({ nodes: [node('\\a')] })
  assertEqual(nomnoml.parse(input).root, expected)
})

suite.test('escaped character in node name', () => {
  const input = '[&ü🐵漢]'
  const expected = part({ nodes: [node('&ü🐵漢')] })
  assertEqual(nomnoml.parse(input).root, expected)
})

suite.test('typed node', () => {
  const input = '[<x>a]'
  const expected = part({ nodes: [node('a', { type: 'x' })] })
  assertEqual(nomnoml.parse(input).root, expected)
})

suite.test('attributed node', () => {
  const input = '[<class meta=x>a]'
  const expected = part({
    nodes: [node('a', { type: 'class', attr: { meta: 'x' } })],
  })
  assertEqual(nomnoml.parse(input).root, expected)
})

suite.test('id attributed node', () => {
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
  assertEqual(nomnoml.parse(input).root, expected)
})

suite.test('node with compartments', () => {
  const input = '[a|foo|bar]'
  const expected = part({
    nodes: [
      node('a', {
        parts: [part({ lines: ['a'] }), part({ lines: ['foo'] }), part({ lines: ['bar'] })],
      }),
    ],
  })
  assertEqual(nomnoml.parse(input).root, expected)
})

suite.test('node with compartments trim text', () => {
  const input = '[a| foo | bar ]'
  const expected = part({
    nodes: [
      node('a', {
        parts: [part({ lines: ['a'] }), part({ lines: ['foo'] }), part({ lines: ['bar'] })],
      }),
    ],
  })
  assertEqual(nomnoml.parse(input).root, expected)
})

suite.test('node with compartments with escaped chars', () => {
  const input = '[a|f\\[\\]\\|]'
  const expected = part({
    nodes: [
      node('a', {
        parts: [part({ lines: ['a'] }), part({ lines: ['f[]|'] })],
      }),
    ],
  })
  assertEqual(nomnoml.parse(input).root, expected)
})

suite.test('line breaks in compartement', () => {
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
  assertEqual(nomnoml.parse(input).root, expected)
})

{
  const expected = part({
    nodes: [node('a', { parts: [part({ lines: ['a', 'b'] })] })],
  })
  suite.test('line break in node name', () => {
    assertEqual(nomnoml.parse('[a\nb]').root, expected)
  })
  suite.test('line separator in node name', () => {
    assertEqual(nomnoml.parse('[a;b]').root, expected)
  })
  suite.test('line separator and break in node name', () => {
    assertEqual(nomnoml.parse('[a\n; b]').root, expected)
  })
}

suite.test('indented compartements', () => {
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
          part({ lines: ['a', ''] }),
          part({ lines: ['foo', 'bar'] }),
          part({ lines: ['baz', 'qux'] }),
          part({ lines: ['zuz'] }),
        ],
      }),
    ],
  })
  assertEqual(nomnoml.parse(input).root, expected)
})

suite.test('omit trailing newlines', () => {
  const input = '[a\n\n|b]'
  const expected = part({
    nodes: [
      node('a', {
        parts: [part({ lines: ['a'] }), part({ lines: ['b'] })],
      }),
    ],
  })
  assertEqual(nomnoml.parse(input).root, expected)
})

suite.test('include trailing newlines that have whitespace', () => {
  const input = '[a\n  |b]'
  const expected = part({
    nodes: [
      node('a', {
        parts: [part({ lines: ['a', ''] }), part({ lines: ['b'] })],
      }),
    ],
  })
  assertEqual(nomnoml.parse(input).root, expected)
})

suite.test('nested nodes', () => {
  const input = `[a|[foo]]`
  const expected = part({
    nodes: [
      node('a', {
        parts: [part({ lines: ['a'] }), part({ nodes: [node('foo')] })],
      }),
    ],
  })
  assertEqual(nomnoml.parse(input).root, expected)
})

suite.test('nested nodes with relations', () => {
  const input = `#background:blue

  [Pirate|
    [a]--[b]
    [a]-:>[c]
  ]`
  const expected = part({
    directives: [{ key: 'background', value: 'blue' }],
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
  assertEqual(nomnoml.parse(input).root, expected)
})

suite.report()

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

function assoc(start, type, end, template = {}) {
  return {
    start,
    end,
    type,
    startLabel: { text: '' },
    endLabel: { text: '' },
    ...template,
  }
}
