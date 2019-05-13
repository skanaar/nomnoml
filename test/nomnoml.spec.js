var nomnoml = require('../dist/nomnoml.js')
var TestSuite = require('./skanaar.testsuite.js')

var Classifier = nomnoml.Classifier;
var Compartment = nomnoml.Compartment

function compClas(type, name, parts){
    return new Compartment([],[new Classifier(type, name, parts)],[])
}

function c(id){ return { type:'CLASS', parts:[[id]], id:id } }
function parse(source){ return nomnoml.intermediateParse(source) }

var suite = TestSuite('nomnoml')
var assertEqual = suite.assertEqual

suite.test('skanaar.testsuite.isEqual', function(){
    test(TestSuite.isEqual([1,2], [1,2]))
    test(!TestSuite.isEqual([2,1], [1,2]))
    test(TestSuite.isEqual({b:4, a:'asdf'}, {a:'asdf', b:4}))
    test(!TestSuite.isEqual({b:4, a:'asdf'}, {a:'asdf'}))
    test(!TestSuite.isEqual({a:'asdf'}, {a:'asdf', b:4}))
    
    function test(condition) {
        if (!condition) throw new Error('testsuite failure')
    }
})

suite.test('skanaar.format', function(){
    var str = nomnoml.skanaar.format('Hi #, how are you #. That is #', 'Bob', 'today', 'good')
    assertEqual(str, 'Hi Bob, how are you today. That is good')
    assertEqual(nomnoml.skanaar.format('# #', 1, 2, 3), '1 2')
    assertEqual(nomnoml.skanaar.format('# # #', 1, 2), '1 2 ')
})

suite.test('skanaar.max', function(){
    assertEqual(nomnoml.skanaar.max([{a:7}, {a:10}, {a:6}], 'a'), 10)
    assertEqual(nomnoml.skanaar.max([{a:7}, {a:10}, {a:6}], e => e.a), 10)
    assertEqual(nomnoml.skanaar.max([7, 10, 6]), 10)
})

suite.test('skanaar.flatten', function(){
    assertEqual(nomnoml.skanaar.flatten([[4, 5]]), [4, 5])
    assertEqual(nomnoml.skanaar.flatten([[7], [4, 5]]), [7, 4, 5])
    assertEqual(nomnoml.skanaar.flatten([[7], [4, 5], [2]]), [7, 4, 5, 2])
})

suite.test('skanaar.indexBy', function(){
    assertEqual(nomnoml.skanaar.indexBy([], 'name'), {})
    assertEqual(nomnoml.skanaar.indexBy([{name:'apa'}], 'name'), {apa:{name:'apa'}})
})

suite.test('jison parser should handle single class', function(){
    var ast = parse('[apa]')
    assertEqual(ast, [c('apa')])
})

suite.test('jison parser should handle single class with compartments', function(){
    var ast = parse('[apa|+field: int;#x:int|apply]')
    assertEqual(ast.length, 1)
    assertEqual(ast[0], {
        type: 'CLASS',
        id: 'apa',
        parts:[['apa'],['+field: int','#x:int'],['apply']]
    })
})

suite.test('jison parser should handle single relation', function(){
    var ast = parse('[apa]->[banan]')
    assertEqual(ast.length, 1)
    var assoc = ast[0]
    assertEqual(assoc.assoc, '->')
    assertEqual(assoc.start, c('apa'))
    assertEqual(assoc.end, c('banan'))
})

suite.test('astBuilder should handle single class', function(){
    var ast = nomnoml.transformParseIntoSyntaxTree([c('apa')])
    assertEqual(ast, new Compartment([],[new Classifier('CLASS', 'apa', [ new Compartment(['apa'],[],[]) ])],[]))
})

suite.test('astBuilder should handle [apa|+field: int;#x:int|apply]', function(){
    var apa = c('apa')
    apa.parts.push(['+field: int', '#x:int'])
    apa.parts.push(['apply'])
    var ast = nomnoml.transformParseIntoSyntaxTree([apa])
    assertEqual(ast, new Compartment([],[new Classifier('CLASS', 'apa', [
        new Compartment(['apa'],[],[]),
        new Compartment(['+field: int', '#x:int'],[],[]),
        new Compartment(['apply'],[],[])
    ])],[]))
})

suite.test('astBuilder should choose longest definition of classes defined twice', function(){
    var first = c('apa')
    var second = c('apa')
    second.parts.push(['+fleas'])
    var ast = nomnoml.transformParseIntoSyntaxTree([first, second])
    assertEqual(ast, new Compartment([],[
        new Classifier('CLASS', 'apa', [ new Compartment(['apa'],[],[]), new Compartment(['+fleas'],[],[]) ])
    ],[]))
})

suite.test('astBuilder should handle single association', function(){
    var jisonOutput = [{
        assoc: '->',
        start: c('apa'),
        end: c('banan'),
        startLabel: '',
        endLabel: ''
    }]
    var ast = nomnoml.transformParseIntoSyntaxTree(jisonOutput)

    assertEqual(ast.nodes.length, 2)
    assertEqual(ast.relations.length, 1)
    assertEqual(ast.nodes, [
        new Classifier('CLASS', 'apa', [new Compartment(['apa'],[],[])]),
        new Classifier('CLASS', 'banan', [new Compartment(['banan'],[],[])])
    ])

    assertEqual(ast, new Compartment([],[
        new Classifier('CLASS', 'apa', [new Compartment(['apa'],[],[])]),
        new Classifier('CLASS', 'banan', [new Compartment(['banan'],[],[])])
    ],[
        {
            id: 0,
            assoc: '->',
            start: 'apa',
            end: 'banan',
            startLabel: '',
            endLabel: ''
        }
    ]))
})

suite.test('astBuilder should handle nested classes [apa|[flea]]', function(){
    var apa = c('apa')
    apa.parts.push([c('flea')])
    var ast = nomnoml.transformParseIntoSyntaxTree([apa])
    assertEqual(ast, 
        new Compartment([], [
            new Classifier('CLASS', 'apa', [
                new Compartment(['apa'],[],[]),
                new Compartment([],[new Classifier('CLASS', 'flea', [new Compartment(['flea'],[],[])])],[])
            ]
        )], [])
    )
})

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
            ],[{
                id: 0,
                type: 'association',
                start: 'flea',
                end: 'dandruff'
            }]
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
            ],[{
                id: 0,
                type: 'association',
                start: 'flea',
                end: 'dandruff'
            }]
        )
    ])
    var layouted = nomnoml.layout(measurer, config, root).nodes[0]
    var rel = layouted.compartments[1].relations[0]
    
    // dagre 0.4.5
    //assertEqual(rel.path, [{x:52,y:7}, {x:52,y:16.5}, {x:52,y:26}])
    
    // dagre 0.7.1
    assertEqual(rel.path, [{x:52,y:7}, {x:52,y:14}, {x:52,y:16.5}, {x:52,y:19}, {x:52,y:26}])
})

suite.report()
