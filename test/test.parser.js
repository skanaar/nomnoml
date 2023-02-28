var { parse } = require('../dist/nomnoml.js')
var TestSuite = require('./TestSuite.js')

var suite = TestSuite('Parser')
var assertEqual = TestSuite.assertEqual

suite.test('choose longest definition of nodes defined twice', () => {
  const input = '[a]\n[a|foo]'
  const expected = part({
    nodes: [node('a', { parts: [part({ lines: ['a'] }), part({ lines: ['foo'] })] })],
  })
  assertEqual(parse(input).root, expected)
})

suite.test('empty source code', function () {
  const expected = part({})
  assertEqual(parse(' \n\t ').root, expected)
})

suite.test('leading whitespace', function () {
  assertEqual(parse('\n[a]').root, part({ nodes: [node('a')] }))
})
suite.test('trailing whitespace', function () {
  assertEqual(parse('[a]\n').root, part({ nodes: [node('a')] }))
})
suite.test('leading and trailing whitespace', function () {
  assertEqual(parse(' \n [a] \n ').root, part({ nodes: [node('a')] }))
})
suite.test('node trailing whitespace', function () {
  assertEqual(parse('[a \n]').root, part({ nodes: [node('a')] }))
})
suite.test('node leading whitespace', function () {
  assertEqual(parse('[\n a]').root, part({ nodes: [node('a')] }))
})
suite.test('node leading and trailing whitespace', function () {
  assertEqual(parse('[\n a \n]').root, part({ nodes: [node('a')] }))
})

suite.test('parse errors are reported on correct line', function () {
  try {
    parse('\n\n[a][b]')
  } catch (e) {
    assertEqual(e.location.start.line, 3)
    return
  }
  throw new Error('parse() must throw error')
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
