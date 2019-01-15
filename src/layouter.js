var nomnoml = nomnoml || {}

nomnoml.layout = function (measurer, config, ast){
	function runDagre(input, style){
		return dagre.layout()
					.rankSep(config.spacing)
					.nodeSep(config.spacing)
					.edgeSep(config.spacing)
					.rankDir(style.direction || config.direction)
					.run(input)
	}
	
	function measureLines(lines, fontWeight){
		if (!lines.length)
			return { width: 0, height: config.padding }
		measurer.setFont(config, fontWeight)
		return {
			width: Math.round(_.max(_.map(lines, measurer.textWidth)) + 2*config.padding),
			height: Math.round(measurer.textHeight() * lines.length + 2*config.padding)
		}
	}
	
	function layoutCompartment(c, compartmentIndex, style){
		var textSize = measureLines(c.lines, compartmentIndex ? 'normal' : 'bold')
		c.width = textSize.width
		c.height = textSize.height

		if (!c.nodes.length && !c.relations.length)
			return

		_.each(c.nodes, layoutClassifier)

		var g = new dagre.Digraph()
		_.each(c.nodes, function (e){
			g.addNode(e.name, { width: e.width, height: e.height })
		})
		_.each(c.relations, function (r){
			g.addEdge(r.id, r.start, r.end)
		})
		var dLayout = runDagre(g, style)

		var rels = skanaar.indexBy(c.relations, 'id')
		var nodes = skanaar.indexBy(c.nodes, 'name')
		function toPoint(o){ return {x:o.x, y:o.y} }
		dLayout.eachNode(function(u, value) {
			nodes[u].x = value.x
			nodes[u].y = value.y
		})
		dLayout.eachEdge(function(e, u, v, value) {
			var start = nodes[u], end = nodes[v]
			rels[e].path = _.map(_.flatten([start, value.points, end]), toPoint)
		})
		var graph = dLayout.graph()
		var graphHeight = graph.height ? graph.height + 2*config.gutter : 0
		var graphWidth = graph.width ? graph.width + 2*config.gutter : 0

		c.width = Math.max(textSize.width, graphWidth) + 2*config.padding
		c.height = textSize.height + graphHeight + config.padding
	}
	
	function layoutClassifier(clas){
		var layout = getLayouter(clas)
		layout(clas)
	}
	
	function getLayouter(clas) {
		var style = config.styles[clas.type] || nomnoml.styles.CLASS
		switch(style.hull) {
			case 'icon': return function (clas){
				clas.width = config.fontSize * 2.5
				clas.height = config.fontSize * 2.5
			}
			case 'empty': return function (clas){
				clas.width = 0
				clas.height = 0
			}
			default: return function (clas){
				_.each(clas.compartments, function(co,i){ layoutCompartment(co, i, style) })
				clas.width = _.max(_.map(clas.compartments, 'width'))
				clas.height = skanaar.sum(clas.compartments, 'height')
				clas.x = clas.width/2
				clas.y = clas.height/2
				_.each(clas.compartments, function(co){ co.width = clas.width })
			}
		}
	}

	layoutCompartment(ast, 0, nomnoml.styles.CLASS)
	return ast
}
