var nomnoml = nomnoml || {}

nomnoml.render = function (graphics, config, compartment, setFont){

	var padding = config.padding
	var g = graphics
	var vm = skanaar.vector

	var X = true;

	var styles = {
		ABSTRACT: { center: X, bold: 0, underline: 0, italic: X, dashed: 0, empty: 0, visual: 'class' },
		ACTOR:    { center: X, bold: 0, underline: 0, italic: 0, dashed: 0, empty: 0, visual: 'actor' },
		CHOICE:   { center: X, bold: 0, underline: 0, italic: 0, dashed: 0, empty: 0, visual: 'rhomb' },
		CLASS:    { center: X, bold: X, underline: 0, italic: 0, dashed: 0, empty: 0, visual: 'class' },
		DATABASE: { center: X, bold: X, underline: 0, italic: 0, dashed: 0, empty: 0, visual: 'database' },
		END:      { center: X, bold: 0, underline: 0, italic: 0, dashed: 0, empty: X, visual: 'end' },
		FRAME:    { center: 0, bold: 0, underline: 0, italic: 0, dashed: 0, empty: 0, visual: 'frame' },
		HIDDEN:   { center: X, bold: 0, underline: 0, italic: 0, dashed: 0, empty: X, visual: 'hidden' },
		INPUT:    { center: X, bold: 0, underline: 0, italic: 0, dashed: 0, empty: 0, visual: 'input' },
		INSTANCE: { center: X, bold: 0, underline: X, italic: 0, dashed: 0, empty: 0, visual: 'class' },
		LABEL:    { center: 0, bold: 0, underline: 0, italic: 0, dashed: 0, empty: 0, visual: 'none' },
		NOTE:     { center: 0, bold: 0, underline: 0, italic: 0, dashed: 0, empty: 0, visual: 'note' },
		PACKAGE:  { center: 0, bold: 0, underline: 0, italic: 0, dashed: 0, empty: 0, visual: 'package' },
		RECEIVER: { center: 0, bold: 0, underline: 0, italic: 0, dashed: 0, empty: 0, visual: 'receiver' },
		REFERENCE:{ center: X, bold: 0, underline: 0, italic: 0, dashed: X, empty: 0, visual: 'class' },
		SENDER:   { center: 0, bold: 0, underline: 0, italic: 0, dashed: 0, empty: 0, visual: 'sender' },
		START:    { center: X, bold: 0, underline: 0, italic: 0, dashed: 0, empty: X, visual: 'start' },
		STATE:    { center: X, bold: 0, underline: 0, italic: 0, dashed: 0, empty: 0, visual: 'roundrect' },
		USECASE:  { center: X, bold: 0, underline: 0, italic: 0, dashed: 0, empty: 0, visual: 'ellipse' },
	}

	_.extend(styles, config.styles)

	var visualizers = {
		actor : function (node, x, y, padding, config, g) {
			var a = padding/2
			var yp = y + a/2
			var actorCenter = {x: node.x, y: yp-a}
			g.circle(actorCenter, a).fillAndStroke()
			g.path([ {x: node.x,	 y: yp}, {x: node.x,	 y: yp+2*a} ]).stroke()
			g.path([ {x: node.x-a, y: yp+a}, {x: node.x+a, y: yp+a} ]).stroke()
			g.path([ {x: node.x-a, y: yp+a+padding},
							 {x: node.x	, y: yp+padding},
							 {x: node.x+a, y: yp+a+padding} ]).stroke()
		},
		class : function (node, x, y, padding, config, g) {
			g.rect(x, y, node.width, node.height).fillAndStroke()
		},
		database : function (node, x, y, padding, config, g) {
			var cy = y-padding/2
			var pi = 3.1416
			g.rect(x, y, node.width, node.height).fill()
			g.path([{x: x, y: cy}, {x: x, y: cy+node.height}]).stroke()
			g.path([
				{x: x+node.width, y: cy},
				{x: x+node.width, y: cy+node.height}]).stroke()
			g.ellipse({x: node.x, y: cy}, node.width, padding*1.5).fillAndStroke()
			g.ellipse({x: node.x, y: cy+node.height}, node.width, padding*1.5, 0, pi)
			.fillAndStroke()
		},
		ellipse : function (node, x, y, padding, config, g) {
			g.ellipse({x: node.x, y: node.y}, node.width, node.height).fillAndStroke()
		},
		end : function (node, x, y, padding, config, g) {
			g.circle(node.x, y+node.height/2, node.height/3).fillAndStroke()
			g.fillStyle(config.stroke)
			g.circle(node.x, y+node.height/2, node.height/3-padding/2).fill()
		},
		frame : function (node, x, y, padding, config, g) {
			g.rect(x, y, node.width, node.height).fillAndStroke()
		},
		hidden : function (node, x, y, padding, config, g) {
		},
		input : function (node, x, y, padding, config, g) {
			g.circuit([
				{x:x+padding, y:y},
				{x:x+node.width, y:y},
				{x:x+node.width-padding, y:y+node.height},
				{x:x, y:y+node.height}
			]).fillAndStroke()
		},
		none : function (node, x, y, padding, config, g) {
		},
		note : function (node, x, y, padding, config, g) {
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
		},
		package : function (node, x, y, padding, config, g) {
			var headHeight = node.compartments[0].height
			g.rect(x, y+headHeight, node.width, node.height-headHeight).fillAndStroke()
			var w = g.measureText(node.name).width + 2*padding
			g.circuit([
				{x:x, y:y+headHeight},
				{x:x, y:y},
				{x:x+w, y:y},
				{x:x+w, y:y+headHeight}
			]).fillAndStroke()
		},
		receiver : function (node, x, y, padding, config, g) {
			g.circuit([
				{x: x, y: y},
				{x: x+node.width+padding, y: y},
				{x: x+node.width-padding, y: y+node.height/2},
				{x: x+node.width+padding, y: y+node.height},
				{x: x, y: y+node.height}
			]).fillAndStroke()
		},
		rhomb : function (node, x, y, padding, config, g) {
			g.circuit([
				{x:node.x, y:y - padding},
				{x:x+node.width + padding, y:node.y},
				{x:node.x, y:y+node.height + padding},
				{x:x - padding, y:node.y}
			]).fillAndStroke()
		},
		roundrect : function (node, x, y, padding, config, g) {
			var r = Math.min(padding*2*config.leading, node.height/2)
			g.roundRect(x, y, node.width, node.height, r).fillAndStroke()
		},
		sender : function (node, x, y, padding, config, g) {
			g.circuit([
				{x: x, y: y},
				{x: x+node.width-padding, y: y},
				{x: x+node.width+padding, y: y+node.height/2},
				{x: x+node.width-padding, y: y+node.height},
				{x: x, y: y+node.height}
			]).fillAndStroke()
		},
		start : function (node, x, y, padding, config, g) {
			g.fillStyle(config.stroke)
			g.circle(node.x, y+node.height/2, node.height/2.5).fill()
		},
	}

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
				y += Math.round(config.fontSize * 0.2)+0.5
				g.path([{x:x-w/2, y:y}, {x:x+w/2, y:y}]).stroke()
				g.lineWidth = config.lineWidth
			}
		})
		g.translate(config.gutter, config.gutter)
		_.each(compartment.relations, function (r){ renderRelation(r, compartment) })
		_.each(compartment.nodes, function (n){ renderNode(n, level) })
		g.restore()
	}

	function renderNode(node, level){
		var x = Math.round(node.x-node.width/2)
		var y = Math.round(node.y-node.height/2)
		var style = styles[node.type] || styles.CLASS

		g.fillStyle(style.fill || config.fill[level] || _.last(config.fill))
		if (style.dashed){
			var dash = Math.max(4, 2*config.lineWidth)
			g.setLineDash([dash, dash])
		}
		var drawNode = visualizers[style.visual] || visualizers.class
		drawNode(node, x, y, padding, config, g)
		g.setLineDash([])

		var yDivider = (style.visual === 'actor' ? y + padding*3/4 : y)
		_.each(node.compartments, function (part, i){
			var s = i > 0 ? {} : style; // only style node title
			if (s.empty) return
			g.save()
			g.translate(x, yDivider)
			setFont(config, s.bold ? 'bold' : 'normal', s.italic)
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
		if (r.endLabel)	 g.fillText(r.endLabel, end.x+labelX, end.y-padding)

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
