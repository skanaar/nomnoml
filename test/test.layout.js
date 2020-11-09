var nomnoml = require('../dist/nomnoml.js')
var TestSuite = require('./TestSuite.js')

var Classifier = nomnoml.Classifier;
var Compartment = nomnoml.Compartment

function compClas(type, name, parts){
    return new Compartment([],[new Classifier(type, name, parts)],[])
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

function parseAndLayout(source) {
    var { root, config } = nomnoml.parse(source)
    return nomnoml.layout(measurer, config, root)
}

var suite = TestSuite('Layout')
var assertEqual = TestSuite.assertEqual
var assert = TestSuite.assert

var textWidth = 100
var config = { spacing: 5, padding: 2, gutter: 0, edgeMargin: 0, styles: nomnoml.styles }
var measurer = {
    textWidth: function (s){ return textWidth },
    textHeight: function (s){ return 10 },
    setFont: function (){}
}

suite.test('layouter should handle [apa]', function(){
    var root = compClas('class', 'apa', [
        new Compartment(['apa'],[],[])
    ])
    var layouted = nomnoml.layout(measurer, config, root).nodes[0]
    assertEqual(layouted.width, 2+100+2)
    assertEqual(layouted.height, 2+10+2)
    assertEqual(layouted.x, 52)
    assertEqual(layouted.y, 7)
})

suite.test('layouter should handle [apa; banana owner]', function(){
    var root = compClas('class', 'apa', [
        new Compartment(['apa','banana owner'],[],[])
    ])
    var layouted = nomnoml.layout(measurer, config, root).nodes[0]
    assertEqual(layouted.width, 2+100+2)
    assertEqual(layouted.height, 2+10+10+2)
})

suite.test('layouter should handle [apa; banana owner| fleaCount]', function(){
    var root = compClas('class', 'apa', [
        new Compartment(['apa','banana owner'],[],[]),
        new Compartment(['fleaCount'],[],[])
    ])
    var layouted = nomnoml.layout(measurer, config, root).nodes[0]
    assertEqual(layouted.width, 2+100+2)
    assertEqual(layouted.height, 2+10+10+2+2+10+2)
})

suite.test('layouter should handle [apa|]', function(){
    var root = compClas('class', 'apa', [
        new Compartment(['apa'],[],[]),
        new Compartment([],[],[])
    ])
    var layouted = nomnoml.layout(measurer, config, root).nodes[0]
    assertEqual(layouted.width, 2+100+2)
    assertEqual(layouted.height, 2+10+2+2)
})

suite.test('layouter should handle [apa|[flea]]', function(){
    var root = compClas('class', 'apa', [
        new Compartment(['apa'],[],[]),
        new Compartment([],[
            new Classifier('class', 'flea', [
                new Compartment(['flea'],[],[])
            ])
        ],[])
    ])
    var layouted = nomnoml.layout(measurer, config, root).nodes[0]
    assertEqual(layouted.width, 2+2+100+2+2)
    assertEqual(layouted.height, 2+10+2+2+2+10+2+2)
})

suite.test('layout [apa|[flea];[dandruff]] horizontally stacked inner classes', function(){
    var root = compClas('class', 'apa', [
        new Compartment(['apa'],[],[]),
        new Compartment([],[
            new Classifier('class', 'flea', [new Compartment(['flea'],[],[])]),
            new Classifier('class', 'dandruff', [new Compartment(['dandruff'],[],[])])
        ],[])
    ])
    var layouted = nomnoml.layout(measurer, config, root).nodes[0]
    assertEqual(layouted.width, 2+2+100+2+5+2+100+2+2)
    assertEqual(layouted.height, 2+10+2+2+2+10+2+2)
})

suite.test('layout [apa|[flea]->[dandruff]] vertically stacked inner classes', function(){
    var root = compClas('class', 'apa', [
        new Compartment(['apa'],[],[]),
        new Compartment([],[
                new Classifier('class', 'flea', [new Compartment(['flea'],[],[])]),
                new Classifier('class', 'dandruff', [new Compartment(['dandruff'],[],[])])
            ],[Association('flea', '-', 'dandruff')]
        )
    ])
    var layouted = nomnoml.layout(measurer, config, root).nodes[0]
    assertEqual(layouted.width, 2+2+100+2+2)
    assertEqual(layouted.height, 2+10+2+2+2+10+2+5+2+10+2+2)
    var flea = layouted.compartments[1].nodes[0]
    var dandruff = layouted.compartments[1].nodes[1]
    assertEqual(flea.x, 52)
    assertEqual(flea.y, 7)
    assertEqual(dandruff.x, 52)
    assertEqual(dandruff.y, 10+2+2+5+7)
})

suite.test('layouter should handle style specific direction', function(){
    var parsedGraph = nomnoml.parse('#.horiz:direction=right\n[<horiz>apa|[a]->[b]]->[banan]')
    var layouted = nomnoml.layout(measurer, parsedGraph.config, parsedGraph.root)
    var apa = layouted.nodes[0]
    var banan = layouted.nodes[1]
    var a = apa.compartments[1].nodes[0]
    var b = apa.compartments[1].nodes[1]
    assertEqual(a.y, b.y)
    assertEqual(apa.x, banan.x)
})

suite.test('layouter should handle [apa|[flea]->[dandruff]] relation placement', function(){
    var root = compClas('class', 'apa', [
        new Compartment(['apa'],[],[]),
        new Compartment([],[
                new Classifier('class', 'flea', [new Compartment(['flea'],[],[])]),
                new Classifier('class', 'dandruff', [new Compartment(['dandruff'],[],[])])
            ],[Association('flea', '-', 'dandruff')]
        )
    ])
    var layouted = nomnoml.layout(measurer, config, root).nodes[0]
    var rel = layouted.compartments[1].relations[0]

    assertEqual(rel.path, [{x:52,y:7}, {x:52,y:14}, {x:52,y:16.5}, {x:52,y:19}, {x:52,y:26}])
})

suite.test('include edges in canvas size calculation', function(){
    var compartment = parseAndLayout(`
    [a] - [foo]
    [foo] - [b]
    [a] - [bar]
    [bar] - [b]
    [a] - [b]`)
    assert(compartment.width, '>', 300)
})

suite.test('<hidden> style works', function() {
    var output = nomnoml.parse('[<hidden>x]\n[a] - [x]\n[x] -> [b]')
    var layouted = nomnoml.layout(measurer, config, output.root)
    assert(layouted.height, '>', 10)
})

suite.test('weightless relations with _> edges', function() {
    var weighted = parseAndLayout('[a]->[b]')
    var weightless = parseAndLayout('[a]_>[b]')
    var directive = parseAndLayout('#gravity: 0\n[a]->[b]')
    assert(weighted.height, '>', weightless.height)
    assert(directive.height, '=', weightless.height)
})

suite.report()
