var nomnoml = nomnoml || {}

nomnoml.render = function (graphics, config, compartment, setFont){

	var padding = config.padding
	var g = graphics
	var vm = skanaar.vector

	function renderCompartment(compartment, style, level){
		g.save()
		g.translate(padding, padding)
		g.fillStyle(config.stroke)
		_.each(compartment.lines, function (text, i){
			g.textAlign(style.center ? 'center' : 'left')
			var x = style.center ? compartment.width/2 - padding : 0
			var y = (0.5+(i+0.5)*config.leading)*config.fontSize
			if (text){
				g.fillText(text, x, y)
			}
			if (style.underline){
				var w = g.measureText(text).width
				y += Math.round(config.fontSize * 0.1)+0.5
				g.path([{x:x-w/2, y:y}, {x:x+w/2, y:y}]).stroke()
				g.lineWidth = config.lineWidth
			}
		})
		g.translate(config.gutter, config.gutter)
		_.each(compartment.relations, function (r){ renderRelation(r, compartment) })
		_.each(compartment.nodes, function (n){ renderNode(n, level) })
		g.restore()
	}

	function textStyle(node, line){
		if (line > 0) return {}
		return {
			CLASS: { bold: true, center: true },
			LABEL: {},
			INSTANCE: { center: true, underline: true },
			FRAME: { center: false, frameHeader: true },
			ABSTRACT: { italic: true, center: true},
			STATE: { center: true},
			DATABASE: { bold: true, center: true},
			NOTE: {},
			ACTOR: {},
			USECASE: { center: true },
			START: { empty: true },
			END: { empty: true },
			INPUT: { center: true },
			CHOICE: { center: true },
			SENDER: {},
			RECEIVER: {},
			HIDDEN: { empty: true },
		}[node.type] || {}
	}

	function renderNode(node, level){
		var x = Math.round(node.x-node.width/2)
		var y = Math.round(node.y-node.height/2)
		var xCenter = x + node.width/2
		var shade = config.fill[level] || _.last(config.fill)
		g.fillStyle(shade)
		if (node.type === 'NOTE'){
			g.circuit([
				{x: x, y: y},
				{x: x+node.width-padding, y: y},
				{x: x+node.width, y: y+padding},
				{x: x+node.width, y: y+node.height},
				{x: x, y: y+node.height},
				{x: x, y: y}
			]).fillAndStroke()
			g.path([
				{x: x+node.width-padding, y: y},
				{x: x+node.width-padding, y: y+padding},
				{x: x+node.width, y: y+padding}
			]).stroke()
		} else if (node.type === 'ACTOR') {
			var a = padding/2
			var yp = y + a/2
			var actorCenter = {x: xCenter, y: yp-a}
			g.circle(actorCenter, a).fillAndStroke()
			g.path([ {x: xCenter,   y: yp},
				     {x: xCenter,   y: yp+2*a} ]).stroke()
			g.path([ {x: xCenter-a, y: yp+a},
				     {x: xCenter+a, y: yp+a} ]).stroke()
			g.path([ {x: xCenter-a, y: yp+a+padding},
				     {x: xCenter  , y: yp+padding},
				     {x: xCenter+a, y: yp+a+padding} ]).stroke()
		} else if (node.type === 'USECASE') {
			var center = {x: xCenter, y: y+node.height/2}
			g.ellipse(center, node.width, node.height).fillAndStroke()
		} else if (node.type === 'START') {
			g.fillStyle(config.stroke)
			g.circle(xCenter, y+node.height/2, node.height/2.5).fill()
		} else if (node.type === 'END') {
			g.circle(xCenter, y+node.height/2, node.height/3).fillAndStroke()
			g.fillStyle(config.stroke)
			g.circle(xCenter, y+node.height/2, node.height/3-padding/2).fill()
		} else if (node.type === 'STATE') {
			var stateRadius = Math.min(padding*2*config.leading, node.height/2)
			g.roundRect(x, y, node.width, node.height, stateRadius).fillAndStroke()
		} else if (node.type === 'INPUT') {
			g.circuit([
				{x:x+padding, y:y},
				{x:x+node.width, y:y},
				{x:x+node.width-padding, y:y+node.height},
				{x:x, y:y+node.height}
			]).fillAndStroke()
		} else if (node.type === 'CHOICE') {
			g.circuit([
				{x:node.x, y:y - padding},
				{x:x+node.width + padding, y:node.y},
				{x:node.x, y:y+node.height + padding},
				{x:x - padding, y:node.y}
			]).fillAndStroke()
		} else if (node.type === 'PACKAGE') {
			var headHeight = node.compartments[0].height
			g.rect(x, y+headHeight, node.width, node.height-headHeight).fillAndStroke()
			var w = g.measureText(node.name).width + 2*padding
			g.circuit([
				{x:x, y:y+headHeight},
				{x:x, y:y},
				{x:x+w, y:y},
				{x:x+w, y:y+headHeight}
		    ]).fillAndStroke()
		} else if (node.type === 'SENDER') {
			g.circuit([
				{x: x, y: y},
				{x: x+node.width-padding, y: y},
				{x: x+node.width+padding, y: y+node.height/2},
				{x: x+node.width-padding, y: y+node.height},
				{x: x, y: y+node.height}
			]).fillAndStroke()
		} else if (node.type === 'RECEIVER') {
			g.circuit([
				{x: x, y: y},
				{x: x+node.width+padding, y: y},
				{x: x+node.width-padding, y: y+node.height/2},
				{x: x+node.width+padding, y: y+node.height},
				{x: x, y: y+node.height}
			]).fillAndStroke()
		} else if (node.type === 'HIDDEN') {
		} else if (node.type === 'DATABASE') {
			var cx = xCenter
			var cy = y-padding/2
			var pi = 3.1416
			g.rect(x, y, node.width, node.height).fill()
			g.path([{x: x, y: cy}, {x: x, y: cy+node.height}]).stroke()
			g.path([
				{x: x+node.width, y: cy},
				{x: x+node.width, y: cy+node.height}]).stroke()
			g.ellipse({x: cx, y: cy}, node.width, padding*1.5).fillAndStroke()
			g.ellipse({x: cx, y: cy+node.height}, node.width, padding*1.5, 0, pi)
				.fillAndStroke()
		} else if (node.type === 'LABEL') {
		} else {
			g.rect(x, y, node.width, node.height).fillAndStroke()
		}
		var yDivider = (node.type === 'ACTOR' ? y + padding*3/4 : y)
		_.each(node.compartments, function (part, i){
			var s = textStyle(node, i)
			if (s.empty) return
			g.save()
			g.translate(x, yDivider)
			setFont(config, s.bold ? 'bold' : 'normal', s.italic)
			renderCompartment(part, s, level+1)
			g.restore()
			if (i+1 === node.compartments.length) return
			yDivider += part.height
			if (node.type === 'FRAME' && i === 0){
				var w = g.measureText(node.name).width+part.height/2+padding
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
			g.beginPath()
			g.moveTo(p[0].x, p[0].y)

			for (var i = 1; i < p.length-1; i++){
				g.arcTo(p[i].x, p[i].y, p[i+1].x, p[i+1].y, radius)
			}
			g.lineTo(_.last(p).x, _.last(p).y)
				g.stroke()
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

		var path = _.flatten([start, _.tail(_.initial(r.path)), end])
		var fontSize = config.fontSize

		g.fillStyle(config.stroke)
		setFont(config, 'normal')
		var textW = g.measureText(r.endLabel).width
		var labelX = config.direction === 'LR' ? -padding-textW : padding
		if (r.startLabel) g.fillText(r.startLabel, start.x+padding, start.y+padding+fontSize)
		if (r.endLabel)   g.fillText(r.endLabel, end.x+labelX, end.y-padding)

		if (r.assoc !== '-/-'){
			if (g.setLineDash && skanaar.hasSubstring(r.assoc, '--')){
				var dash = Math.max(4, 2*config.lineWidth)
				g.setLineDash([dash, dash])
				strokePath(path)
				g.setLineDash([])
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

	function rectIntersection(p1, p2, rect) {
		if (rect.width || rect.height) {
			var xBound = rect.width/2 + config.edgeMargin;
			var yBound = rect.height/2 + config.edgeMargin;
			var delta = vm.diff(p1, p2);
			var t;
			if (delta.x && delta.y) {
				t = Math.min(Math.abs(xBound/delta.x), Math.abs(yBound/delta.y));
			} else {
				t = Math.abs(delta.x ? xBound/delta.x : yBound/delta.y);
			}
			return vm.add(p2, vm.mult(delta, t));
		}
		return p2;
	}

	function drawArrow(path, isOpen, arrowPoint, diamond){
		var size = (config.spacing - 2*config.edgeMargin) * config.arrowSize / 30
		var v = vm.diff(path[path.length-2], _.last(path))
		var nv = vm.normalize(v)
		function getArrowBase(s){ return vm.add(arrowPoint, vm.mult(nv, s*size)) }
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
	renderCompartment(compartment, {}, 0)
	g.restore()
}
