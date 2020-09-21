namespace nomnoml {

	export function render(graphics: Graphics, config: Config, compartment: Compartment, setFont: nomnoml.SetFont){

		var g = graphics
		var vm = nomnoml.skanaar.vector

		function renderCompartment(compartment: Compartment, style: Style, level: number){
			g.save()
			g.translate(compartment.offset.x, compartment.offset.y)
			g.fillStyle(style.stroke || config.stroke)
			compartment.lines.forEach(function (text, i){
				g.textAlign(style.center ? 'center' : 'left')
				var x = style.center ? compartment.width/2 - config.padding : 0
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
			compartment.relations.forEach(function (r){ renderRelation(r) })
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
			g.setData('name', node.name)
			drawNode(node, x, y, config, g)
			g.setLineDash([])

			g.save()
			g.translate(x, y)

			node.compartments.forEach(function (part: Compartment, i: number){
				var s = i > 0 ? buildStyle({ stroke: style.stroke }) : style; // only style node title
				if (s.empty) return
				g.save()
				g.translate(part.x, part.y)
				setFont(config, s.bold ? 'bold' : 'normal', s.italic ? 'italic' : undefined)
				renderCompartment(part, s, level+1)
				g.restore()
			})
			for(var divider of node.dividers) {
				g.path(divider).stroke()
			}
			
			g.restore()
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

	    function renderLabel(label: RelationLabel){
			if (!label || !label.text) return
			var fontSize = config.fontSize
			var lines = label.text.split('`')
			lines.forEach((l, i) => g.fillText(l, label.x, label.y + fontSize*(i+1)))
		}

		function renderRelation(r: Relation){
			var start = r.path[1]
			var end = r.path[r.path.length-2]
			var path = r.path.slice(1, -1)
			
			g.fillStyle(config.stroke)
			setFont(config, 'normal')

			renderLabel(r.startLabel)
			renderLabel(r.endLabel)

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
		
		function setBackground() {
			g.clear()
			g.save()
			g.strokeStyle('transparent')
			g.fillStyle(config.background)
			g.rect(0, 0, compartment.width, compartment.height).fill()
			g.restore()
		}

		g.save()
		g.scale(config.zoom, config.zoom)
		setBackground()
		setFont(config, 'bold')
		g.lineWidth(config.lineWidth)
		g.lineJoin('round')
		g.lineCap('round')
		g.strokeStyle(config.stroke)
		snapToPixels()
		renderCompartment(compartment, buildStyle({ stroke: undefined }), 0)
		g.restore()
	}
}
