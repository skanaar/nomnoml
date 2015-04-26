var nomnoml = nomnoml || {}

nomnoml.Classifier = function (type, name, compartments){
	return {
        type: type,
        name: name,
        compartments: compartments
    }
}
nomnoml.Compartment = function (lines, nodes, relations){
	return {
        lines: lines,
        nodes: nodes,
        relations: relations
    }
}

nomnoml.layout = function (measurer, config, ast){
	function runDagre(input){
		input.setGraph({
			ranksep: config.spacing,
			nodesep: config.spacing,
			edgesep: config.spacing,
			rankdir: config.direction
		})
		dagre.layout(input)
		return input
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
	function layoutCompartment(c, compartmentIndex){
		var textSize = measureLines(c.lines, compartmentIndex ? 'normal' : 'bold')
		c.width = textSize.width
		c.height = textSize.height

		if (!c.nodes.length && !c.relations.length)
			return

		_.each(c.nodes, layoutClassifier)

		var g = new dagre.graphlib.Graph({ directed: true, multigraph: true })
		//g.setGraph({})
		//g.setDefaultEdgeLabel(function () { return {} })
		_.each(c.nodes, function (e){
			g.setNode(e.name, { width: e.width, height: e.height })
		})
		_.each(c.relations, function (r){
			g.setEdge(r.start, r.end, {}, r.id)
		})
		var dLayout = runDagre(g)

		var rels = _.indexBy(c.relations, 'id')
		var nodes = _.indexBy(c.nodes, 'name')
		function toPoint(o){ return {x:o.x, y:o.y} }
		_.each(dLayout.nodes(), function(n) {
			var node = dLayout.node(n)
			nodes[n].x = node.x
			nodes[n].y = node.y
		})
		_.each(dLayout.edges(), function(e) {
			var edge = dLayout.edge(e)
			var start = nodes[e.v], end = nodes[e.w]
			rels[e.name].path = _.map(_.flatten([start, edge.points, end]), toPoint)
		})
		var graph = dLayout.graph()
		var graphHeight = graph.height ? graph.height + 2*config.gutter : 0
		var graphWidth = graph.width ? graph.width + 2*config.gutter : 0

		c.width = Math.max(textSize.width, graphWidth) + 2*config.padding
		c.height = textSize.height + graphHeight + config.padding
	}
	function layoutClassifier(clas){
		_.each(clas.compartments, layoutCompartment)
		clas.width = _.max(_.pluck(clas.compartments, 'width'))
		clas.height = _skanaar.sum(clas.compartments, 'height')
		if (clas.type == 'HIDDEN'){
			clas.width = 0
			clas.height = 0
		}
		clas.x = clas.width/2
		clas.y = clas.height/2
		_.each(clas.compartments, function(co){ co.width = clas.width })
	}
	layoutCompartment(ast)
	return ast
}
