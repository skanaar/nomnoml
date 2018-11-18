var _ = require('lodash')
var nomnoml = require('../dist/nomnoml.js')
var TestSuite = require('./skanaar.testsuite.js')

/* import */ var clas = nomnoml.Classifier, comp = nomnoml.Compartment

function compClas(type, name, parts){
    return comp([],[clas(type, name, parts)],[])
}

function c(id){ return { type:'CLASS', parts:[[id]], id:id } }
function parse(source){ return nomnoml.intermediateParse(source) }

var suite = TestSuite('nomnoml')
var assertEqual = suite.assertEqual

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
    assertEqual(ast, comp([],[clas('CLASS', 'apa', [ comp(['apa'],[],[]) ])],[]))
})

suite.test('astBuilder should handle [apa|+field: int;#x:int|apply]', function(){
    var apa = c('apa')
    apa.parts.push(['+field: int', '#x:int'])
    apa.parts.push(['apply'])
    var ast = nomnoml.transformParseIntoSyntaxTree([apa])
    assertEqual(ast, comp([],[clas('CLASS', 'apa', [
        comp(['apa'],[],[]),
        comp(['+field: int', '#x:int'],[],[]),
        comp(['apply'],[],[])
    ])],[]))
})

suite.test('astBuilder should choose longest definition of classes defined twice', function(){
    var first = c('apa')
    var second = c('apa')
    second.parts.push(['+fleas'])
    var ast = nomnoml.transformParseIntoSyntaxTree([first, second])
    assertEqual(ast, comp([],[
        clas('CLASS', 'apa', [ comp(['apa'],[],[]), comp(['+fleas'],[],[]) ])
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
        clas('CLASS', 'apa', [comp(['apa'],[],[])]),
        clas('CLASS', 'banan', [comp(['banan'],[],[])])
    ])

    assertEqual(ast, comp([],[
        clas('CLASS', 'apa', [comp(['apa'],[],[])]),
        clas('CLASS', 'banan', [comp(['banan'],[],[])])
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
    var input = c('apa')
    input.parts.push([c('flea')])
    var ast = nomnoml.transformParseIntoSyntaxTree(input)
    assertEqual(ast, clas('CLASS', 'apa', [
        comp(['apa'],[],[]),
        comp([],[clas('CLASS', 'flea', [comp(['flea'],[],[])])],[])
    ]))
})

var textWidth = 100
var config = { spacing: 5, padding: 2, gutter: 0, styles: nomnoml.styles }
var measurer = {
    textWidth: function (s){ return textWidth },
    textHeight: function (s){ return 10 },
    setFont: function (){}
}

suite.test('layouter should handle [apa]', function(){
    var root = compClas('class', 'apa', [
        comp(['apa'],[],[])
    ])
    var layouted = nomnoml.layout(measurer, config, root).nodes[0]
    assertEqual(layouted.width, 2+100+2)
    assertEqual(layouted.height, 2+10+2)
    assertEqual(layouted.x, 52)
    assertEqual(layouted.y, 7)
})

suite.test('layouter should handle [apa; banana owner]', function(){
    var root = compClas('class', 'apa', [
        comp(['apa','banana owner'],[],[])
    ])
    var layouted = nomnoml.layout(measurer, config, root).nodes[0]
    assertEqual(layouted.width, 2+100+2)
    assertEqual(layouted.height, 2+10+10+2)
})

suite.test('layouter should handle [apa; banana owner| fleaCount]', function(){
    var root = compClas('class', 'apa', [
        comp(['apa','banana owner'],[],[]),
        comp(['fleaCount'],[],[])
    ])
    var layouted = nomnoml.layout(measurer, config, root).nodes[0]
    assertEqual(layouted.width, 2+100+2)
    assertEqual(layouted.height, 2+10+10+2+2+10+2)
})

suite.test('layouter should handle [apa|]', function(){
    var root = compClas('class', 'apa', [
        comp(['apa'],[],[]),
        comp([],[],[])
    ])
    var layouted = nomnoml.layout(measurer, config, root).nodes[0]
    assertEqual(layouted.width, 2+100+2)
    assertEqual(layouted.height, 2+10+2+2)
})

suite.test('layouter should handle [apa|[flea]]', function(){
    var root = compClas('class', 'apa', [
        comp(['apa'],[],[]),
        comp([],[
            clas('class', 'flea', [
                comp(['flea'],[],[])
            ])
        ],[])
    ])
    var layouted = nomnoml.layout(measurer, config, root).nodes[0]
    assertEqual(layouted.width, 2+2+100+2+2)
    assertEqual(layouted.height, 2+10+2+2+2+10+2+2)
})

suite.test('layouter should handle [apa|[flea];[dandruff]] horizontally stacked inner classes', function(){
    var root = compClas('class', 'apa', [
        comp(['apa'],[],[]),
        comp([],[
            clas('class', 'flea', [comp(['flea'],[],[])]),
            clas('class', 'dandruff', [comp(['dandruff'],[],[])])
        ],[])
    ])
    var layouted = nomnoml.layout(measurer, config, root).nodes[0]
    assertEqual(layouted.width, 2+2+100+2+5+2+100+2+2)
    assertEqual(layouted.height, 2+10+2+2+2+10+2+2)
})

suite.test('layouter should handle [apa|[flea]->[dandruff]] vertically stacked inner classes', function(){
    var root = compClas('class', 'apa', [
        comp(['apa'],[],[]),
        comp([],[
                clas('class', 'flea', [comp(['flea'],[],[])]),
                clas('class', 'dandruff', [comp(['dandruff'],[],[])])
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

suite.test('layouter should handle [apa|[flea]->[dandruff]] relation placement', function(){
    var root = compClas('class', 'apa', [
        comp(['apa'],[],[]),
        comp([],[
                clas('class', 'flea', [comp(['flea'],[],[])]),
                clas('class', 'dandruff', [comp(['dandruff'],[],[])])
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
    assertEqual(rel.path, [{x:52,y:7}, {x:52,y:16.5}, {x:52,y:26}])
    
    // dagre 0.7.1
    //assertEqual(rel.path, [{x:52,y:7}, {x:52,y:14}, {x:52,y:16.5}, {x:52,y:19}, {x:52,y:26}])
})

suite.report()
