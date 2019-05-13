namespace nomnoml {

	type Quadrant = 1|2|3|4

	export function render(graphics: Graphics, config: Config, compartment: Compartment, setFont: nomnoml.SetFont){

		var padding = config.padding
		var g = graphics
		var vm = nomnoml.skanaar.vector

		function renderCompartment(compartment: Compartment, style: Style, level: number){
			g.save()
			g.translate(padding, padding)
			g.fillStyle(style.stroke || config.stroke)
			compartment.lines.forEach(function (text, i){
				g.textAlign(style.center ? 'center' : 'left')
				var x = style.center ? compartment.width/2 - padding : 0
				var y = (0.5+(i+0.5)*config.leading)*config.fontSize
				if (text){
					g.fillText(text, x, y)
				}
				if (style.underline){
					var w = g.measureText(text).width
					y += Math.round(config.fontSize * 0.2)+0.5
					g.path([{x:x-w/2, y:y}, {x:x+w/2, y:y}]).stroke()
					g.lineWidth(config.lineWidth)
				}
			})
			g.translate(config.gutter, config.gutter)
			compartment.relations.forEach(function (r){ renderRelation(r, compartment) })
			compartment.nodes.forEach(function (n){ renderNode(n, level) })
			g.restore()
		}

		function renderNode(node: Classifier, level: number){
			var x = Math.round(node.x-node.width/2)
			var y = Math.round(node.y-node.height/2)
			var style = config.styles[node.type] || nomnoml.styles.CLASS

			g.fillStyle(style.fill || config.fill[level] || skanaar.last(config.fill))
			g.strokeStyle(style.stroke || config.stroke)
			if (style.dashed){
				var dash = Math.max(4, 2*config.lineWidth)
				g.setLineDash([dash, dash])
			}
			var drawNode = nomnoml.visualizers[style.visual] || nomnoml.visualizers.class
			drawNode(node, x, y, config, g)
			g.setLineDash([])

			var yDivider = (style.visual === 'actor' ? y + padding*3/4 : y)
			node.compartments.forEach(function (part: Compartment, i: number){
				var s = i > 0 ? buildStyle({ stroke: style.stroke }) : style; // only style node title
				if (s.empty) return
				g.save()
				g.translate(x, yDivider)
				setFont(config, s.bold ? 'bold' : 'normal', s.italic ? 'italic' : undefined)
				renderCompartment(part, s, level+1)
				g.restore()
				if (i+1 === node.compartments.length) return
				yDivider += part.height
				if (style.visual === 'frame' && i === 0){
					var w = g.measureText(node.name).width+part.height/2+padding
					g.path([
						{x:x, y:yDivider},
						{x:x+w-part.height/2, y:yDivider},
						{x:x+w, y:yDivider-part.height/2},
						{x:x+w, y:yDivider-part.height}
						]).stroke()
				} else {
					g.path([{x:x, y:yDivider}, {x:x+node.width, y:yDivider}]).stroke()
				}
			})
		}

		function strokePath(p: Vector[]){
			if (config.edges === 'rounded'){
				var radius = config.spacing * config.bendSize
				g.beginPath()
				g.moveTo(p[0].x, p[0].y)

				for (var i = 1; i < p.length-1; i++){
					g.arcTo(p[i].x, p[i].y, p[i+1].x, p[i+1].y, radius)
				}
				g.lineTo(skanaar.last(p).x, skanaar.last(p).y)
				g.stroke()
			}
			else
				g.path(p).stroke()
		}

		var empty = false, filled = true, diamond = true

	    function renderLabel(text: string, pos: Vector, quadrant: Quadrant){
			if (text) {
				var fontSize = config.fontSize
				var lines = text.split('`')
				var area = {
					width : skanaar.max(lines.map(function(l){ return g.measureText(l).width })),
					height : fontSize*lines.length
				}
				var origin = {
					x: pos.x + ((quadrant==1 || quadrant==4) ? padding : -area.width - padding),
					y: pos.y + ((quadrant==3 || quadrant==4) ? padding : -area.height - padding)
				}
				lines.forEach(function(l, i){ g.fillText(l, origin.x, origin.y + fontSize*(i+1)) })
			}
		}

		// find basic quadrant using relative position of endpoint and block rectangle
		function quadrant(point: Vector, node: Classifier, fallback: Quadrant): Quadrant {
			if (point.x < node.x && point.y < node.y) return 1;
			if (point.x > node.x && point.y < node.y) return 2;
			if (point.x > node.x && point.y > node.y) return 3;
			if (point.x < node.x && point.y > node.y) return 4;
			return fallback;
		}

		// Flip basic label quadrant if needed, to avoid crossing a bent relationship line
		function adjustQuadrant(quadrant: Quadrant, point: Vector, opposite: Vector): Quadrant {
			if ((opposite.x == point.x) || (opposite.y == point.y)) return quadrant;
			var flipHorizontally: Quadrant[] = [4, 3, 2, 1]
			var flipVertically: Quadrant[] = [2, 1, 4, 3]
			var oppositeQuadrant = (opposite.y < point.y) ?
								((opposite.x < point.x) ? 2 : 1) :
								((opposite.x < point.x) ? 3 : 4);
			// if an opposite relation end is in the same quadrant as a label, we need to flip the label
			if (oppositeQuadrant === quadrant) {
				if (config.direction === 'LR') return flipHorizontally[quadrant-1];
				if (config.direction === 'TB') return flipVertically[quadrant-1];
			}
			return quadrant; 	
		}

		function renderRelation(r: Relation, compartment: Compartment){
			var startNode = skanaar.find(compartment.nodes, function(e: Classifier){ return e.name == r.start })
			var endNode = skanaar.find(compartment.nodes, function(e: Classifier){ return e.name == r.end })
			var start = r.path[1]
			var end = r.path[r.path.length-2]
			var path = r.path.slice(1, -1)
			
			g.fillStyle(config.stroke)
			setFont(config, 'normal')

			renderLabel(r.startLabel, start, adjustQuadrant(quadrant(start, startNode, 4), start, end))
			renderLabel(r.endLabel, end, adjustQuadrant(quadrant(end, endNode, 2), end, start))

			if (r.assoc !== '-/-'){
				if (skanaar.hasSubstring(r.assoc, '--')){
					var dash = Math.max(4, 2*config.lineWidth)
					g.setLineDash([dash, dash])
					strokePath(path)
					g.setLineDash([])
				}
				else
					strokePath(path)
			}

			function drawArrowEnd(id: string, path: Vector[], end: Vector){
				if (id === '>' || id === '<')
					drawArrow(path, filled, end, false)
				else if (id === ':>' || id === '<:')
					drawArrow(path, empty, end, false)
				else if (id === '+')
					drawArrow(path, filled, end, diamond)
				else if (id === 'o')
					drawArrow(path, empty, end, diamond)
			}

			var tokens = r.assoc.split('-')
			drawArrowEnd(skanaar.last(tokens), path, end)
			drawArrowEnd(tokens[0], path.reverse(), start)
		}

		function drawArrow(path: Array<Vector>, isOpen: boolean, arrowPoint: Vector, diamond: boolean){
			var size = config.spacing * config.arrowSize / 30
			var v = vm.diff(path[path.length-2], skanaar.last(path))
			var nv = vm.normalize(v)
			function getArrowBase(s: number){ return vm.add(arrowPoint, vm.mult(nv, s*size)) }
			var arrowBase = getArrowBase(diamond ? 7 : 10)
			var t = vm.rot(nv)
			var arrowButt = (diamond) ? getArrowBase(14)
					: (isOpen && !config.fillArrows) ? getArrowBase(5) : arrowBase
			var arrow = [
				vm.add(arrowBase, vm.mult(t, 4*size)),
				arrowButt,
				vm.add(arrowBase, vm.mult(t, -4*size)),
				arrowPoint
			]
			g.fillStyle(isOpen ? config.stroke : config.fill[0])
			g.circuit(arrow).fillAndStroke()
		}

		function snapToPixels(){
			if (config.lineWidth % 2 === 1)
				g.translate(0.5, 0.5)
		}

		g.clear()
		setFont(config, 'bold')
		g.save()
		g.lineWidth(config.lineWidth)
		g.lineJoin('round')
		g.lineCap('round')
		g.strokeStyle(config.stroke)
		g.scale(config.zoom, config.zoom)
		snapToPixels()
		renderCompartment(compartment, buildStyle({ stroke: undefined }), 0)
		g.restore()
	}
}
