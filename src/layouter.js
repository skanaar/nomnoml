var nomnoml = nomnoml || {}

nomnoml.layout = function (measurer, config, ast){
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

		var g = new dagre.graphlib.Graph()
		g.setGraph({
			rankdir: style.direction || config.direction,
			//align: //undefined [UL, UR, DL, DR]
			nodesep: config.spacing, //50 
			edgesep: config.spacing, //10 
			ranksep: config.spacing, //50 
			//marginx: //0 
			//marginy: //0 
			//acyclicer: //undefined [greedy] 
			//ranker: //network-simplex [network-simplex, tight-tree or longest-path]
		});
		_.each(c.nodes, function (e){
			g.setNode(e.name, { width: e.layoutWidth, height: e.layoutHeight })
		})
		_.each(c.relations, function (r){
			g.setEdge(r.start, r.end, { id: r.id })
		})
		dagre.layout(g)

		var rels = skanaar.indexBy(c.relations, 'id')
		var nodes = skanaar.indexBy(c.nodes, 'name')
		function toPoint(o){ return {x:o.x, y:o.y} }
		_.each(g.nodes(), function(name) {
			var node = g.node(name)
			nodes[name].x = node.x
			nodes[name].y = node.y
		})
		_.each(g.edges(), function(edgeObj) {
			var edge = g.edge(edgeObj)
			var start = nodes[edgeObj.v]
			var end = nodes[edgeObj.w]
			rels[edge.id].path = _.map(_.flatten([start, edge.points, end]), toPoint)
		})
		var graph = g.graph()
		var graphHeight = graph.height ? graph.height + 2*config.gutter : 0
		var graphWidth = graph.width ? graph.width + 2*config.gutter : 0

		c.width = Math.max(textSize.width, graphWidth) + 2*config.padding
		c.height = textSize.height + graphHeight + config.padding
	}
	
	function layoutClassifier(clas){
		var layout = getLayouter(clas)
		layout(clas)
		clas.layoutWidth = clas.width + 2*config.edgeMargin
		clas.layoutHeight = clas.height + 2*config.edgeMargin
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
				clas.x = clas.layoutWidth/2
				clas.y = clas.layoutHeight/2
				_.each(clas.compartments, function(co){ co.width = clas.width })
			}
		}
	}

	layoutCompartment(ast, 0, nomnoml.styles.CLASS)
	return ast
}
