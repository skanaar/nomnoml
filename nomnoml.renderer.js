var nomnoml = nomnoml || {}

nomnoml.render = function (graphics, config, compartment, setFont){

	var padding = config.padding
	var g = graphics

	function renderCompartment(compartment, style, level){
		g.ctx.save()
		g.ctx.translate(padding, padding)
		g.ctx.fillStyle = config.stroke
		_.each(compartment.lines, function (text, i){
			g.ctx.textAlign = style.center ? 'center' : 'left'
			var x = style.center ? compartment.width/2 - padding : 0
			var y = (0.5+(i+.5)*config.leading)*config.fontSize
			g.ctx.fillText(text, x, y)
			if (style.underline){
				var w = g.ctx.measureText(text).width
				y += Math.round(config.fontSize * 0.1)+0.5
				g.ctx.lineWidth = Math.round(config.fontSize/10)
				g.path([{x:x-w/2, y:y}, {x:x+w/2, y:y}]).stroke()
				g.ctx.lineWidth = config.lineWidth
			}
		})
		g.ctx.translate(config.gutter, config.gutter)
		_.each(compartment.relations, function (r){ renderRelation(r, compartment) })
		_.each(compartment.nodes, function (n){ renderNode(n, level) })
		g.ctx.restore()
	}

	function textStyle(node, line){
		if (line === 0){
			switch (node.type){
				case 'CLASS': return { bold: true, center: true }
				case 'INSTANCE': return { center: true, underline: true }
				case 'FRAME': return { center: false, frameHeader: true }
				case 'ABSTRACT': return { italic: true, center: true}
				case 'STATE': return { center: true}
				case 'DATABASE': return { bold: true, center: true}
				case 'NOTE': return {}
				case 'START': return { empty: true }
				case 'END': return { empty: true }
				case 'STATE': return { center: true }
				case 'INPUT': return { center: true }
				case 'CHOICE': return { center: true }
				case 'SENDER': return {}
				case 'RECEIVER': return {}
				case 'HIDDEN': return { empty: true }
			}
		}
		return {}
	}

	function renderNode(node, level){
		var x = Math.round(node.x-node.width/2)
		var y = Math.round(node.y-node.height/2)
		var shade = config.fill[level] || _.last(config.fill)
		g.ctx.fillStyle = shade
		if (node.type === 'NOTE'){
			g.circuit([
				{x: x, y: y},
				{x: x+node.width-padding, y: y},
				{x: x+node.width, y: y+padding},
				{x: x+node.width, y: y+node.height},
				{x: x, y: y+node.height},
				{x: x, y: y}
			]).fill().stroke()
			g.path([
				{x: x+node.width-padding, y: y},
				{x: x+node.width-padding, y: y+padding},
				{x: x+node.width, y: y+padding}
			]).stroke()
		} else if (node.type === 'START') {
			g.ctx.fillStyle = config.stroke
			g.circle(x+node.width/2, y+node.height/2, node.height/2.5).fill()
		} else if (node.type === 'END') {
			g.circle(x+node.width/2, y+node.height/2, node.height/3).fill().stroke()
			g.ctx.fillStyle = config.stroke
			g.circle(x+node.width/2, y+node.height/2, node.height/3-padding/2).fill()
		} else if (node.type === 'STATE') {
			var r = Math.min(padding*2*config.leading, node.height/2)
			g.roundRect(x, y, node.width, node.height, r).fill().stroke()
		} else if (node.type === 'INPUT') {
			g.circuit([
				{x:x+padding, y:y},
				{x:x+node.width, y:y},
				{x:x+node.width-padding, y:y+node.height},
				{x:x, y:y+node.height}
			]).fill().stroke()
		} else if (node.type === 'CHOICE') {
			g.circuit([
				{x:node.x, y:y - padding},
				{x:x+node.width + padding, y:node.y},
				{x:node.x, y:y+node.height + padding},
				{x:x - padding, y:node.y}
			]).fill().stroke()
		} else if (node.type === 'PACKAGE') {
			var headHeight = node.compartments[0].height
			g.ctx.fillRect(x, y+headHeight, node.width, node.height-headHeight)
			g.ctx.strokeRect(x, y+headHeight, node.width, node.height-headHeight)
			var w = g.ctx.measureText(node.name).width + 2*padding
			g.circuit([
				{x:x, y:y+headHeight},
				{x:x, y:y},
				{x:x+w, y:y},
				{x:x+w, y:y+headHeight}
		    ]).fill().stroke()
		} else if (node.type === 'SENDER') {
			g.circuit([
				{x: x, y: y},
				{x: x+node.width-padding, y: y},
				{x: x+node.width+padding, y: y+node.height/2},
				{x: x+node.width-padding, y: y+node.height},
				{x: x, y: y+node.height}
			]).fill().stroke()
		} else if (node.type === 'RECEIVER') {
			g.circuit([
				{x: x, y: y},
				{x: x+node.width+padding, y: y},
				{x: x+node.width-padding, y: y+node.height/2},
				{x: x+node.width+padding, y: y+node.height},
				{x: x, y: y+node.height}
			]).fill().stroke()
		} else if (node.type === 'HIDDEN') {
		} else if (node.type === 'DATABASE') {
			var cx = x+node.width/2
			var cy = y-padding/2
			g.ctx.fillRect(x, y, node.width, node.height)
			g.path([{x: x, y: cy}, {x: x, y: cy+node.height}]).stroke()
			g.path([{x: x+node.width, y: cy}, {x: x+node.width, y: cy+node.height}]).stroke()
			g.ellipse({x: cx, y: cy}, node.width, padding*1.5).fill().stroke()
			g.ellipse({x: cx, y: cy+node.height}, node.width, padding*1.5, 0, 3.1416).fill().stroke()
		} else {
			g.ctx.fillRect(x, y, node.width, node.height)
			g.ctx.strokeRect(x, y, node.width, node.height)
		}
		var yDivider = y
		_.each(node.compartments, function (part, i){
			var s = textStyle(node, i)
			if (s.empty) return
			g.ctx.save()
			g.ctx.translate(x, yDivider)
			setFont(config, s.bold ? 'bold' : 'normal', s.italic)
			renderCompartment(part, s, level+1)
			g.ctx.restore()
			if (i+1 == node.compartments.length) return
			yDivider += part.height
			if (node.type === 'FRAME' && i === 0){
				var w = g.ctx.measureText(node.name).width + part.height/2 + padding
				g.path([
					{x:x, y:yDivider},
					{x:x+w-part.height/2, y:yDivider},
					{x:x+w, y:yDivider-part.height/2},
					{x:x+w, y:yDivider-part.height}
			    ]).stroke()
			} else
				g.path([{x:x, y:yDivider}, {x:x+node.width, y:yDivider}]).stroke()
		})
	}

	function strokePath(p){
		if (config.edges === 'rounded'){
			var radius = config.spacing * config.bendSize
	        g.ctx.beginPath()
	        g.ctx.moveTo(p[0].x, p[0].y)
			for (var i = 1; i < p.length-1; i++){
				var vec = diff(p[i], p[i-1])
				var bendStart = add(p[i-1], mult(normalize(vec), mag(vec)-radius))
				g.ctx.lineTo(bendStart.x, bendStart.y)
				g.ctx.arcTo(p[i].x, p[i].y, p[i+1].x, p[i+1].y, radius)
			}
			g.ctx.lineTo(_.last(p).x, _.last(p).y)
	        g.ctx.stroke()
		}
		else 
			g.path(p).stroke()
	}

	var empty = false, filled = true, diamond = true

	function renderRelation(r, compartment){
		var startNode = _.findWhere(compartment.nodes, {name:r.start})
		var endNode = _.findWhere(compartment.nodes, {name:r.end})

		var start = rectIntersection(r.path[1], _.first(r.path), startNode)
		var end = rectIntersection(r.path[r.path.length-2], _.last(r.path), endNode)

		var path = [start]
		for(var i=1; i<r.path.length-1; i++) path.push(r.path[i])
		path.push(end)

		g.ctx.fillStyle = config.stroke
		setFont(config, 'normal')
		g.ctx.fillText(r.startLabel, start.x+padding, start.y+padding+config.fontSize)
		g.ctx.fillText(r.endLabel, end.x+padding, end.y-padding)

		if (r.assoc != '-/-'){
			if (g.ctx.setLineDash && _.hasSubstring(r.assoc, '--')){
				var dash = Math.max(4, 2*config.lineWidth)
				g.ctx.setLineDash([dash, dash])
				strokePath(path)
				g.ctx.setLineDash([])
			}
			else
				strokePath(path)
		}

		function drawArrowEnd(id, path, end){
			if (id === '>' || id === '<')
				drawArrow(path, filled, end)
			else if (id === ':>' || id === '<:')
				drawArrow(path, empty, end)
			else if (id === '+')
				drawArrow(path, filled, end, diamond)
			else if (id === 'o')
				drawArrow(path, empty, end, diamond)
		}

		var tokens = r.assoc.split('-')
		drawArrowEnd(_.last(tokens), path, end)
		drawArrowEnd(_.first(tokens), path.reverse(), start)
	}

	function rectIntersection(p1, p2, rect){
		if(rect.width == 0 && rect.height == 0) return p2
		var v = diff(p1, p2)
		for(var t=1; t>=0; t-= 0.01){
			var p = mult(v, t)
			if(Math.abs(p.x) <= rect.width/2+config.edgeMargin && Math.abs(p.y) <= rect.height/2+config.edgeMargin)
				return add(p2, p)
		}
		return p2
	}

	function drawArrow(path, isOpen, arrowPoint, diamond){
		var size = (config.spacing - 2*config.edgeMargin) * config.arrowSize / 30
		var v = diff(path[path.length-2], _.last(path))
		var nv = normalize(v)
		function getArrowBase(s){ return add(arrowPoint, mult(nv, s*size)) }
		var arrowBase = getArrowBase(diamond ? 7 : 10)
		var t = rot(nv)
		var arrowButt = (diamond) ? getArrowBase(14)
				: (isOpen && !config.fillArrows) ? getArrowBase(5) : arrowBase
		var arrow = [
			add(arrowBase, mult(t, 4*size)),
			arrowButt,
			add(arrowBase, mult(t, -4*size)),
			arrowPoint
		]
		g.ctx.fillStyle = isOpen ? config.stroke : config.fill[0]
		var ctx = g.circuit(arrow).fill().stroke()
	}

	function snapToPixels(){
		if (config.lineWidth % 2 == 1)
			g.ctx.translate(0.5, 0.5)
	}

	g.clear()
	setFont(config, 'bold')
	g.ctx.save()
	g.ctx.lineWidth = config.lineWidth
	g.ctx.lineJoin = 'round'
	g.ctx.lineCap = 'round'
	g.ctx.strokeStyle = config.stroke
	g.ctx.scale(config.zoom, config.zoom)
	snapToPixels()
	renderCompartment(compartment, {}, 0)
	g.ctx.restore()
}
