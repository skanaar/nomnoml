var nomnoml = require('../dist/nomnoml.js')
var TestSuite = require('./TestSuite.js')

var Classifier = nomnoml.Classifier
var Compartment = nomnoml.Compartment

function c(id) {
  return { type: 'CLASS', parts: [[id]], id: id }
}

function Association(start, assoc, end) {
  return {
    id: 0,
    start,
    end,
    assoc,
    startLabel: { text: '' },
    endLabel: { text: '' },
  }
}

var suite = TestSuite('Parser')
var assertEqual = TestSuite.assertEqual
var assert = TestSuite.assert

suite.test('jison parser should handle single class', function () {
  var ast = nomnoml.intermediateParse('[apa]')
  assertEqual(ast, [c('apa')])
})

suite.test('jison parser should handle single class with compartments', function () {
  var ast = nomnoml.intermediateParse('[apa|+field: int;#x:int|apply]')
  assertEqual(ast.length, 1)
  assertEqual(ast[0], {
    type: 'CLASS',
    id: 'apa',
    parts: [['apa'], ['+field: int', '#x:int'], ['apply']],
  })
})

suite.test('jison parser should handle single relation', function () {
  var ast = nomnoml.intermediateParse('[apa]->[banan]')
  assertEqual(ast.length, 1)
  var assoc = ast[0]
  assertEqual(assoc.assoc, '->')
  assertEqual(assoc.start, c('apa'))
  assertEqual(assoc.end, c('banan'))
})

suite.test('astBuilder should handle single class', function () {
  var ast = nomnoml.transformParseIntoSyntaxTree([c('apa')])
  assertEqual(
    ast,
    new Compartment([], [new Classifier('CLASS', 'apa', [new Compartment(['apa'], [], [])])], [])
  )
})

suite.test('astBuilder should handle [apa|+field: int;#x:int|apply]', function () {
  var apa = c('apa')
  apa.parts.push(['+field: int', '#x:int'])
  apa.parts.push(['apply'])
  var ast = nomnoml.transformParseIntoSyntaxTree([apa])
  assertEqual(
    ast,
    new Compartment(
      [],
      [
        new Classifier('CLASS', 'apa', [
          new Compartment(['apa'], [], []),
          new Compartment(['+field: int', '#x:int'], [], []),
          new Compartment(['apply'], [], []),
        ]),
      ],
      []
    )
  )
})

suite.test('astBuilder should choose longest definition of classes defined twice', function () {
  var first = c('apa')
  var second = c('apa')
  second.parts.push(['+fleas'])
  var ast = nomnoml.transformParseIntoSyntaxTree([first, second])
  assertEqual(
    ast,
    new Compartment(
      [],
      [
        new Classifier('CLASS', 'apa', [
          new Compartment(['apa'], [], []),
          new Compartment(['+fleas'], [], []),
        ]),
      ],
      []
    )
  )
})

suite.test('astBuilder should handle single association', function () {
  var jisonOutput = [
    {
      assoc: '->',
      start: c('apa'),
      end: c('banan'),
      startLabel: '',
      endLabel: '',
    },
  ]
  var ast = nomnoml.transformParseIntoSyntaxTree(jisonOutput)

  assertEqual(ast.nodes.length, 2)
  assertEqual(ast.relations.length, 1)
  assertEqual(ast.nodes, [
    new Classifier('CLASS', 'apa', [new Compartment(['apa'], [], [])]),
    new Classifier('CLASS', 'banan', [new Compartment(['banan'], [], [])]),
  ])

  assertEqual(
    ast,
    new Compartment(
      [],
      [
        new Classifier('CLASS', 'apa', [new Compartment(['apa'], [], [])]),
        new Classifier('CLASS', 'banan', [new Compartment(['banan'], [], [])]),
      ],
      [Association('apa', '->', 'banan')]
    )
  )
})

suite.test('astBuilder should handle nested classes [apa|[flea]]', function () {
  var apa = c('apa')
  apa.parts.push([c('flea')])
  var ast = nomnoml.transformParseIntoSyntaxTree([apa])
  assertEqual(
    ast,
    new Compartment(
      [],
      [
        new Classifier('CLASS', 'apa', [
          new Compartment(['apa'], [], []),
          new Compartment(
            [],
            [new Classifier('CLASS', 'flea', [new Compartment(['flea'], [], [])])],
            []
          ),
        ]),
      ],
      []
    )
  )
})

suite.test('gracefully handle equivalent relations', function () {
  var parsedGraph = nomnoml.parse('[a]-[b]\n[a]-[b]')
  assertEqual(parsedGraph.root.relations.length, 1)
})

suite.test('leading and trailing whitespace', function () {
  nomnoml.parse('\n[a]')
  nomnoml.parse('[a]\n')
  nomnoml.parse(' \n [a] \n ')
})

suite.test('parse errors are reported on correct line', function () {
  try {
    nomnoml.parse('\n[a][b]')
  } catch (e) {
    var position = e.message.substr('Parse error on '.length, 6)
    assert(position, '=', 'line 2')
    return
  }
  assert('failure', '=', '')
})

suite.report()
