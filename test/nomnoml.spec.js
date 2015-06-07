describe('nomnoml', function() {
    /* import */ var clas = nomnoml.Classifier, comp = nomnoml.Compartment

    function compClas(type, name, parts){
        return comp([],[clas(type, name, parts)],[])
    }

    function c(id){ return { type:'CLASS', parts:[[id]], id:id } }
    function parse(source){ return nomnoml.intermediateParse(source) }

    describe('jison parser', function() {
        it('should handle single class', function(){
            var ast = parse('[apa]')
            expect(ast).toEqual([c('apa')])
        })

        it('should handle single class with compartments', function(){
            var ast = parse('[apa|+field: int;#x:int|apply]')
            expect(ast.length).toEqual(1)
            expect(ast[0]).toEqual({
                type: 'CLASS',
                id: 'apa',
                parts:[['apa'],['+field: int','#x:int'],['apply']]
            })
        })

        it('should handle single relation', function(){
            var ast = parse('[apa]->[banan]')
            expect(ast.length).toEqual(1)
            var assoc = ast[0]
            expect(assoc.assoc).toEqual('->')
            expect(assoc.start).toEqual(c('apa'))
            expect(assoc.end).toEqual(c('banan'))
        })
    })

    describe('astBuilder', function() {
        it('should handle single class', function(){
            var ast = nomnoml.transformParseIntoSyntaxTree([c('apa')])
            expect(ast).toEqual(comp([],[clas('CLASS', 'apa', [ comp(['apa'],[],[]) ])],[]))
        })

        it('should handle [apa|+field: int;#x:int|apply]', function(){
            var apa = c('apa')
            apa.parts.push(['+field: int', '#x:int'])
            apa.parts.push(['apply'])
            var ast = nomnoml.transformParseIntoSyntaxTree([apa])
            expect(ast).toEqual(comp([],[clas('CLASS', 'apa', [
                comp(['apa'],[],[]),
                comp(['+field: int', '#x:int'],[],[]),
                comp(['apply'],[],[])
            ])],[]))
        })

        it('should choose longest definition of classes defined twice', function(){
            var first = c('apa')
            var second = c('apa')
            second.parts.push(['+fleas'])
            var ast = nomnoml.transformParseIntoSyntaxTree([first, second])
            expect(ast).toEqual(comp([],[
                clas('CLASS', 'apa', [ comp(['apa'],[],[]), comp(['+fleas'],[],[]) ])
            ],[]))
        })

        it('should handle single association', function(){
            var jisonOutput = [{
                assoc: '->',
                start: c('apa'),
                end: c('banan'),
                startLabel: '',
                endLabel: ''
            }]
            var ast = nomnoml.transformParseIntoSyntaxTree(jisonOutput)

            expect(ast.nodes.length).toEqual(2)
            expect(ast.relations.length).toEqual(1)
            expect(ast.nodes).toEqual([
                clas('CLASS', 'apa', [comp(['apa'],[],[])]),
                clas('CLASS', 'banan', [comp(['banan'],[],[])])
            ])

            expect(ast).toEqual(comp([],[
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

        it('should handle nested classes [apa|[flea]]', function(){
            var input = c('apa')
            input.parts.push([c('flea')])
            var ast = nomnoml.transformParseIntoSyntaxTree(input)
            expect(ast).toEqual(clas('CLASS', 'apa', [
                comp(['apa'],[],[]),
                comp([],[clas('CLASS', 'flea', [comp(['flea'],[],[])])],[])
            ]))
        })
    })

    describe('layout engine', function() {
        var textWidth = 100
        var config = { spacing: 5, padding: 2, gutter: 0 }
        var measurer = {
            textWidth: function (s){ return textWidth },
            textHeight: function (s){ return 10 },
            setFont: function (){}
        }

        it('should handle [apa]', function(){
            var root = compClas('class', 'apa', [
                comp(['apa'],[],[])
            ])
            var layouted = nomnoml.layout(measurer, config, root).nodes[0]
            expect(layouted.width).toEqual(2+100+2)
            expect(layouted.height).toEqual(2+10+2)
            console.log(layouted)
            expect(layouted.x).toEqual(52)
            expect(layouted.y).toEqual(7)
        })

        it('should handle [apa; banana owner]', function(){
            var root = compClas('class', 'apa', [
                comp(['apa','banana owner'],[],[])
            ])
            var layouted = nomnoml.layout(measurer, config, root).nodes[0]
            expect(layouted.width).toEqual(2+100+2)
            expect(layouted.height).toEqual(2+10+10+2)
        })

        it('should handle [apa; banana owner| fleaCount]', function(){
            var root = compClas('class', 'apa', [
                comp(['apa','banana owner'],[],[]),
                comp(['fleaCount'],[],[])
            ])
            var layouted = nomnoml.layout(measurer, config, root).nodes[0]
            expect(layouted.width).toEqual(2+100+2)
            expect(layouted.height).toEqual(2+10+10+2+2+10+2)
        })

        it('should handle [apa|]', function(){
            var root = compClas('class', 'apa', [
                comp(['apa'],[],[]),
                comp([],[],[])
            ])
            var layouted = nomnoml.layout(measurer, config, root).nodes[0]
            expect(layouted.width).toEqual(2+100+2)
            expect(layouted.height).toEqual(2+10+2+2)
        })

        it('should handle [apa|[flea]]', function(){
            var root = compClas('class', 'apa', [
                comp(['apa'],[],[]),
                comp([],[
                    clas('class', 'flea', [
                        comp(['flea'],[],[])
                    ])
                ],[])
            ])
            var layouted = nomnoml.layout(measurer, config, root).nodes[0]
            expect(layouted.width).toEqual(2+2+100+2+2)
            expect(layouted.height).toEqual(2+10+2+2+2+10+2+2)
        })

        it('should handle [apa|[flea];[dandruff]] horizontally stacked inner classes', function(){
            var root = compClas('class', 'apa', [
                comp(['apa'],[],[]),
                comp([],[
                    clas('class', 'flea', [comp(['flea'],[],[])]),
                    clas('class', 'dandruff', [comp(['dandruff'],[],[])])
                ],[])
            ])
            var layouted = nomnoml.layout(measurer, config, root).nodes[0]
            expect(layouted.width).toEqual(2+2+100+2+5+2+100+2+2)
            expect(layouted.height).toEqual(2+10+2+2+2+10+2+2)
        })

        it('should handle [apa|[flea]->[dandruff]] vertically stacked inner classes', function(){
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
            expect(layouted.width).toEqual(2+2+100+2+2)
            expect(layouted.height).toEqual(2+10+2+2+2+10+2+5+2+10+2+2)
            var flea = layouted.compartments[1].nodes[0]
            var dandruff = layouted.compartments[1].nodes[1]
            expect(flea.x).toEqual(52)
            expect(flea.y).toEqual(7)
            expect(dandruff.x).toEqual(52)
            expect(dandruff.y).toEqual(10+2+2+5+7)
        })

        it('should handle [apa|[flea]->[dandruff]] relation placement', function(){
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
            //expect(rel.path).toEqual([{x:52,y:7}, {x:52,y:16.5}, {x:52,y:26}])    // dagre 0.4.5
            expect(rel.path).toEqual([{x:52,y:7}, {x:52,y:14}, {x:52,y:16.5}, {x:52,y:19}, {x:52,y:26}])    // dagre 0.7.1
        })

    })

})
