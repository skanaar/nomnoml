namespace nomnoml {

	export function layout(measurer: Measurer, config: Config, ast: Compartment): Compartment {

		function measureLines(lines: string[], fontWeight: 'normal'|'bold'){
			if (!lines.length)
				return { width: 0, height: config.padding }
			measurer.setFont(config, fontWeight, 'normal')
			return {
				width: Math.round(skanaar.max(lines.map(measurer.textWidth)) + 2*config.padding),
				height: Math.round(measurer.textHeight() * lines.length + 2*config.padding)
			}
		}
		
		function layoutCompartment(c: Compartment, compartmentIndex: number, style: Style){
			var textSize = measureLines(c.lines, compartmentIndex ? 'normal' : 'bold')
			c.width = textSize.width
			c.height = textSize.height

			if (!c.nodes.length && !c.relations.length)
				return

			c.nodes.forEach(layoutClassifier)

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
			c.nodes.forEach(function (e){
				g.setNode(e.name, { width: e.layoutWidth, height: e.layoutHeight })
			})
			c.relations.forEach(function (r){
				g.setEdge(r.start, r.end, { id: r.id })
			})
			dagre.layout(g)

			var rels = skanaar.indexBy(c.relations, 'id')
			var nodes = skanaar.indexBy(c.nodes, 'name')
			function toPoint(o:{x:number, y:number}){ return {x:o.x, y:o.y} }
			g.nodes().forEach(function(name) {
				var node = g.node(name)
				nodes[name].x = node.x
				nodes[name].y = node.y
			})
			g.edges().forEach(function(edgeObj) {
				var edge = g.edge(edgeObj)
				var start = nodes[edgeObj.v]
				var end = nodes[edgeObj.w]
				rels[edge.id].path = skanaar.flatten([[start], edge.points, [end]]).map(toPoint)
			})
			var graph = g.graph()
			var graphHeight = graph.height ? graph.height + 2*config.gutter : 0
			var graphWidth = graph.width ? graph.width + 2*config.gutter : 0

			c.width = Math.max(textSize.width, graphWidth) + 2*config.padding
			c.height = textSize.height + graphHeight + config.padding
		}
		
		function layoutClassifier(clas: Classifier): void {
			var layout = getLayouter(clas)
			layout(clas)
			clas.layoutWidth = clas.width + 2*config.edgeMargin
			clas.layoutHeight = clas.height + 2*config.edgeMargin
		}
		
		function getLayouter(clas: Classifier): (clas: Classifier) => void {
			var style = config.styles[clas.type] || nomnoml.styles.CLASS
			switch(style.hull) {
				case 'icon': return function (clas: Classifier){
					clas.width = config.fontSize * 2.5
					clas.height = config.fontSize * 2.5
				}
				case 'empty': return function (clas: Classifier){
					clas.width = 0
					clas.height = 0
				}
				default: return function (clas){
					clas.compartments.forEach(function(co,i){ layoutCompartment(co, i, style) })
					clas.width = skanaar.max(clas.compartments, 'width')
					clas.height = skanaar.sum(clas.compartments, 'height')
					clas.x = clas.layoutWidth/2
					clas.y = clas.layoutHeight/2
					clas.compartments.forEach(function(co){ co.width = clas.width })
				}
			}
		}

		layoutCompartment(ast, 0, nomnoml.styles.CLASS)
		return ast
	}
}
