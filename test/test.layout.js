var nomnoml = require('../dist/nomnoml.js')
var { test } = require('node:test')
var { assert, deepEqual } = require('./assert.js')
var { part, node } = require('./utils.js')

function rooted(node) {
  return part({ nodes: [node] })
}

function Association(start, type, end) {
  const startLabel = { text: '' }
  const endLabel = { text: '' }
  return { id: 0, start, end, type, startLabel, endLabel }
}

function parseAndLayout(source) {
  var { root, config } = nomnoml.parse(source)
  return nomnoml.layout(measurer, config, root)
}

var textWidth = 100
var config = {
  spacing: 5,
  padding: 2,
  gutter: 0,
  edgeMargin: 0,
  styles: nomnoml.styles,
}
var measurer = {
  textWidth: function (s) {
    return textWidth
  },
  textHeight: function (s) {
    return 10
  },
  setFont: function () {},
}

test('layouter should handle [apa]', function () {
  var root = node('apa', { parts: [part({ lines: ['apa'] })] })
  var layouted = nomnoml.layout(measurer, config, rooted(root)).nodes[0]
  deepEqual(layouted.width, 2 + 100 + 2)
  deepEqual(layouted.height, 2 + 10 + 2)
  deepEqual(layouted.x, 52)
  deepEqual(layouted.y, 7)
})

test('layouter should handle [apa; banana owner]', function () {
  var root = node('apa', { parts: [part({ lines: ['apa', 'banana owner'] })] })
  var layouted = nomnoml.layout(measurer, config, rooted(root)).nodes[0]
  deepEqual(layouted.width, 2 + 100 + 2)
  deepEqual(layouted.height, 2 + 10 + 10 + 2)
})

test('layouter should handle [apa; banana owner| fleaCount]', function () {
  var root = node('apa', {
    parts: [part({ lines: ['apa', 'banana owner'] }), part({ lines: ['fleaCount'] })],
  })
  var layouted = nomnoml.layout(measurer, config, rooted(root)).nodes[0]
  deepEqual(layouted.width, 2 + 100 + 2)
  deepEqual(layouted.height, 2 + 10 + 10 + 2 + 2 + 10 + 2)
})

test('layouter should handle [apa|]', function () {
  var root = node('apa', {
    parts: [part({ lines: ['apa'] }), part({ lines: [] })],
  })
  var layouted = nomnoml.layout(measurer, config, rooted(root)).nodes[0]
  deepEqual(layouted.width, 2 + 100 + 2)
  deepEqual(layouted.height, 2 + 10 + 2 + 2)
})

test('layouter should handle [apa|[flea]]', function () {
  var root = node('apa', {
    parts: [
      part({ lines: ['apa'] }),
      part({
        nodes: [node('flea', { parts: [part({ lines: ['flea'] })] })],
      }),
    ],
  })

  var layouted = nomnoml.layout(measurer, config, rooted(root)).nodes[0]
  deepEqual(layouted.width, 2 + 2 + 100 + 2 + 2)
  deepEqual(layouted.height, 2 + 10 + 2 + 2 + 2 + 10 + 2 + 2)
})

test('layout [apa|[flea];[dandruff]] horizontally stacked inner classes', function () {
  var root = node('apa', {
    parts: [
      part({ lines: ['apa'] }),
      part({
        nodes: [
          node('flea', { parts: [part({ lines: ['flea'] })] }),
          node('dandruff', { parts: [part({ lines: ['dandruff'] })] }),
        ],
      }),
    ],
  })
  var layouted = nomnoml.layout(measurer, config, rooted(root)).nodes[0]
  deepEqual(layouted.width, 2 + 2 + 100 + 2 + 5 + 2 + 100 + 2 + 2)
  deepEqual(layouted.height, 2 + 10 + 2 + 2 + 2 + 10 + 2 + 2)
})

test('layout [apa|[flea]->[dandruff]] vertically stacked inner classes', function () {
  var root = node('apa', {
    parts: [
      part({ lines: ['apa'] }),
      part({
        nodes: [
          node('flea', { parts: [part({ lines: ['flea'] })] }),
          node('dandruff', { parts: [part({ lines: ['dandruff'] })] }),
        ],
        assocs: [Association('flea', '-', 'dandruff')],
      }),
    ],
  })
  var layouted = nomnoml.layout(measurer, config, rooted(root)).nodes[0]
  deepEqual(layouted.width, 2 + 2 + 100 + 2 + 2)
  deepEqual(layouted.height, 2 + 10 + 2 + 2 + 2 + 10 + 2 + 5 + 2 + 10 + 2 + 2)
  var flea = layouted.parts[1].nodes[0]
  var dandruff = layouted.parts[1].nodes[1]
  deepEqual(flea.x, 52)
  deepEqual(flea.y, 7)
  deepEqual(dandruff.x, 52)
  deepEqual(dandruff.y, 10 + 2 + 2 + 5 + 7)
})

test('layouter should handle style specific direction', function () {
  var parsedGraph = nomnoml.parse('#.horiz:direction=right\n[<horiz>apa|[a]->[b]]->[banan]')
  var layouted = nomnoml.layout(measurer, parsedGraph.config, parsedGraph.root)
  var apa = layouted.nodes[0]
  var banan = layouted.nodes[1]
  var a = apa.parts[1].nodes[0]
  var b = apa.parts[1].nodes[1]
  deepEqual(a.y, b.y)
  deepEqual(apa.x, banan.x)
})

test('layouter should handle [apa|[flea]->[dandruff]] relation placement', function () {
  var root = node('apa', {
    parts: [
      part({ lines: ['apa'] }),
      part({
        nodes: [
          node('flea', { parts: [part({ lines: ['flea'] })] }),
          node('dandruff', { parts: [part({ lines: ['dandruff'] })] }),
        ],
        assocs: [Association('flea', '-', 'dandruff')],
      }),
    ],
  })
  var layouted = nomnoml.layout(measurer, config, rooted(root))
  var rel = layouted.nodes[0].parts[1].assocs[0]

  deepEqual(rel.path, [
    { x: 52, y: 7 },
    { x: 52, y: 14 },
    { x: 52, y: 16.5 },
    { x: 52, y: 19 },
    { x: 52, y: 26 },
  ])
})

test('include edges in canvas size calculation', function () {
  var compartment = parseAndLayout(`
    [a]-[foo]
    [foo]-[b]
    [a]-[bar]
    [bar]-[b]
    [a]-[b]`)
  assert(compartment.width, '>', 300)
})

test('<hidden> style works', function () {
  var output = nomnoml.parse('[<hidden>x]\n[a]-[x]\n[x]->[b]')
  var layouted = nomnoml.layout(measurer, config, output.root)
  assert(layouted.height, '>', 10)
})
