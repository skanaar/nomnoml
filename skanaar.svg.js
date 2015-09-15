var skanaar = skanaar || {}
skanaar.Svg = function (){
	var states = [State(0, 0)]
	var elements = []

	function Element(name, attr) {
		attr.style = ''
		return {
			name: name,
			attr: attr,
			stroke: function (){
				this.attr.style += 'stroke:' + lastDefined('stroke') + ';';
				return this
			},
			fill: function (){
				this.attr.style += 'fill:' + lastDefined('fill') + ';';
				return this
			}
		}
	}

	function State(dx, dy){
		return { x: dx, y: dy, style: { stroke: '', fill: '' } }
	}

	function trans(coord, axis){
		states.forEach(function (t){ coord += t[axis] })
		return coord
	}
	function tX(coord){ return trans(coord, 'x') }
	function tY(coord){ return trans(coord, 'y') }
	function lastDefined(property){
		for(var i=states.length-1; i>=0; i--)
			if (states[i].style[property])
				return states[i].style[property]
		return undefined
	}

	function last(list){ return list[list.length-1] }

	function tracePath(path, offset, s){
		s = s === undefined ? 1 : s
		offset = offset || {x:0, y:0}
		var points = []
		points.push('M' + tX(offset.x + s*path[0].x) + ' ' + tY(offset.y + s*path[0].y))
		for(var i=1, len=path.length; i<len; i++)
			points.push('L' + tX(offset.x + s*path[i].x) + ' ' + tY(offset.y + s*path[i].y))
		return newElement('path', { d: points.join(' ') })
	}

	function newElement(type, attr) {
		var element = Element(type, attr)
		elements.push(element)
		return element
	}

	return {
		width: function (){ return elements.width },
		height: function (){ return elements.height },
		background: function (/*r, g, b*/){},
		clear: function (){},
		circle: function (x, y, r){
			var attr = (arguments.length === 2) ? 
					{cx: x.x, cy: x.y, r: y} :
					{cx: x, cy: y, r: r}
			var element = Element('circle', attr)
			elements.push(element)
			return Element
		},
		ellipse: function (center, rx, ry, start, stop){
			return newElement('ellipse',
				{ cx: tX(center.x), cy: tY(center.y), rx: rx, ry: ry })
		},
		arc: function (x, y, r, start, stop){
			return newElement('ellipse',
				{ cx: tX(x), cy: tY(y), rx: r, ry: r })
		},
		roundRect: function (x, y, w, h, r){
			return newElement('rect',
				{ x: tX(x), y: tY(y), rx: r, ry: r, height: h, width: h })
		},
		rect: function (x, y, w, h){
			return newElement('rect',
				{ x: tX(x), y: tY(y), height: h, width: w })
		},
		path: tracePath,
		circuit: function (path, offset, s){
			var element = tracePath(path, offset, s)
			element.attr.d += ' Z'
			return element
		},
		font: function (){},
		strokeStyle: function (stroke){
			last(states).style.stroke = stroke
		},
		fillStyle: function (fill){
			last(states).style.fill = fill
		},
		arcTo: function (){},
		beginPath: function (){
			return newElement('path', {d:''})
		},
		fillText: function (){},
		lineCap: function (){},
		lineJoin: function (){},
		lineTo: function (x, y){
			last(elements).attr.d += ('L' + tX(x) + ' ' + tY(y) + ' ')
		},
		lineWidth: function (){},
		measureText: function (s){
			return { width: s.length * 12 }
		},
		moveTo: function (x, y){
			last(elements).attr.d += ('M' + tX(x) + ' ' + tY(y) + ' ')
		},
		restore: function (){
			states.pop()
		},
		save: function (){
			states.push(State(0, 0))
		},
		scale: function (){},
		setLineDash: function (){},
		stroke: function (){
			last(elements).stroke()
		},
		textAlign: function (){},
		translate: function (dx, dy){
			last(states).x += dx
			last(states).y += dy
		},
		serialize: function (){
			var innerSvg = elements.map(function (e){
				var attr = Object.keys(e.attr).map(function (key){
					return key + '="' + e.attr[key] + '"'
				}).join(' ')
				return '<'+e.name+' '+attr+'/>'
			}).join('/n')
			return '<svg version="1.1" '+
			'baseProfile="full" '+
			'xmlns="http://www.w3.org/2000/svg" '+
			'xmlns:xlink="http://www.w3.org/1999/xlink" '+
			'xmlns:ev="http://www.w3.org/2001/xml-events">'+
			innerSvg+
			'</svg>'
		}
	}
};
