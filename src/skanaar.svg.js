var skanaar = skanaar || {}
skanaar.Svg = function (globalStyle, canvas){
	var initialState = {
		x: 0,
		y: 0,
		stroke: 'none',
		dashArray: 'none',
		fill: 'none',
		textAlign: 'left'
	}
	var states = [initialState]
	var elements = []

	// canvas is an optional parameter
	canvas = canvas || 0
	var ctx = canvas ? canvas.getContext('2d') : null
	var canUseCanvas = false
	var waitingForFirstFont = true
	var docFont = ''

	function Element(name, attr, content) {
		attr.style = attr.style || ''
		return {
			name: name,
			attr: attr,
			content: content || undefined,
			stroke: function (){
				this.attr.style += 'stroke:'+lastDefined('stroke')+
				  ';fill:none;stroke-dasharray:' + lastDefined('dashArray') + ';';
				return this
			},
			fill: function (){
				this.attr.style += 'stroke:none; fill:'+lastDefined('fill')+';';
				return this
			},
			fillAndStroke: function (){
				this.attr.style += 'stroke:'+lastDefined('stroke')+';fill:'+lastDefined('fill')+
				  ';stroke-dasharray:' + lastDefined('dashArray') + ';';
				return this
			}
		}
	}

	function State(dx, dy){
		return { x: dx, y: dy, stroke: null, fill: null, textAlign: null }
	}

	function trans(coord, axis){
		states.forEach(function (t){ coord += t[axis] })
		return coord
	}
	function tX(coord){ return Math.round(10*trans(coord, 'x'))/10 }
	function tY(coord){ return Math.round(10*trans(coord, 'y'))/10 }
	function lastDefined(property){
		for(var i=states.length-1; i>=0; i--)
			if (states[i][property])
				return states[i][property]
		return undefined
	}

	function last(list){ return list[list.length-1] }

	function tracePath(path, offset, s){
		s = s === undefined ? 1 : s
		offset = offset || {x:0, y:0}
		var d = path.map(function (e, i){
			return (i ? 'L' : 'M') + tX(offset.x + s*e.x) + ' ' + tY(offset.y + s*e.y)
		}).join(' ')
		return newElement('path', { d: d })
	}

	function newElement(type, attr, content) {
		var element = Element(type, attr, content)
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
					{r: y, cx: tX(x.x), cy: tY(x.y)} :
					{r: r, cx: tX(x),   cy: tY(y)}
			var element = Element('circle', attr)
			elements.push(element)
			return element
		},
		ellipse: function (center, w, h, start, stop){
			if (stop) {
				// This code does not render a general partial ellipse. It only
				// renders the bottom half of an ellipse. Useful for database visuals.
				var y = tY(center.y)
				return newElement('path', { d:
					'M' + tX(center.x - w/2) + ' ' + y +
					'A' + w/2 + ' ' + h/2 + ' 0 1 0 ' + tX(center.x + w/2) + ' ' + y
				})
			} else {
				return newElement('ellipse',
				{ cx: tX(center.x), cy: tY(center.y), rx: w/2, ry: h/2 })
			}
		},
		arc: function (x, y, r /*, start, stop*/){
			return newElement('ellipse',
				{ cx: tX(x), cy: tY(y), rx: r, ry: r })
		},
		roundRect: function (x, y, w, h, r){
			return newElement('rect',
				{ x: tX(x), y: tY(y), rx: r, ry: r, height: h, width: w })
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
		font: function (font){
			last(states).font = font;

			if (waitingForFirstFont) {
				// This is our first chance to test if we can use a canvas to measure text width.
				if (ctx) {
					var primaryFont = font.replace(/^.*family:/, '').replace(/[, ].*$/, '')
					primaryFont = primaryFont.replace(/'/g, '')
					canUseCanvas = /^(Arial|Helvetica|Times|Times New Roman)$/.test(primaryFont)
					if (canUseCanvas) {
						var fontSize = font.replace(/^.*font-size:/, '').replace(/;.*$/, '') + ' '
						if (primaryFont === 'Arial') {
							docFont = fontSize + 'Arial, Helvetica, sans-serif'
						} else if (primaryFont === 'Helvetica') {
							docFont = fontSize + 'Helvetica, Arial, sans-serif'
						} else if (primaryFont === 'Times New Roman') {
							docFont = fontSize + '"Times New Roman", Times, serif'
						} else if (primaryFont === 'Times') {
							docFont = fontSize + 'Times, "Times New Roman", serif'
						}
					}
				}
				waitingForFirstFont = false
			}
		},
		strokeStyle: function (stroke){
			last(states).stroke = stroke
		},
		fillStyle: function (fill){
			last(states).fill = fill
		},
		arcTo: function (x1, y1, x2, y2){
			last(elements).attr.d += ('L'+tX(x1)+' '+tY(y1)+' L'+tX(x2)+' '+tY(y2)+' ')
		},
		beginPath: function (){
			return newElement('path', {d:''})
		},
		fillText: function (text, x, y){
			if (lastDefined('textAlign') === 'center')
				x -= this.measureText(text).width/2
			var attr = { x: tX(x), y: tY(y), style: '' }
			var font = lastDefined('font')
			if (font.indexOf('bold') === -1) {
				attr.style = 'font-weight:normal;'
			}
			if (font.indexOf('italic') > -1) {
				attr.style += 'font-style:italic;'
			}
			return newElement('text', attr, _.escape(text))
		},
		lineCap: function (cap){ globalStyle += ';stroke-linecap:'+cap },
		lineJoin: function (join){ globalStyle += ';stroke-linejoin:'+join },
		lineTo: function (x, y){
			last(elements).attr.d += ('L' + tX(x) + ' ' + tY(y) + ' ')
		},
		lineWidth: function (w){ globalStyle += ';stroke-width:'+w},
		measureText: function (s){
			if (canUseCanvas) {
				var fontStr = lastDefined('font')
				var italicSpec = (/\bitalic\b/.test(fontStr) ? 'italic' : 'normal') + ' normal '
				var boldSpec = /\bbold\b/.test(fontStr) ? 'bold ' : 'normal '
				ctx.font = italicSpec + boldSpec + docFont
				return ctx.measureText(s)
			} else {
				return {
					width: skanaar.sum(s, function (c){
						if (c === 'M' || c === 'W') { return 14 }
						return c.charCodeAt(0) < 200 ? 9.5 : 16
					})
				}	
			}
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
		setLineDash: function (d){
			last(states).dashArray = (d.length === 0) ? 'none' : d[0] + ' ' + d[1]
		},
		stroke: function (){
			last(elements).stroke()
		},
		textAlign: function (a){
			last(states).textAlign = a
		},
		translate: function (dx, dy){
			last(states).x += dx
			last(states).y += dy
		},
		serialize: function (_attributes){
			var attrs = _attributes || {};
			attrs.version = attrs.version || '1.1';
			attrs.baseProfile = attrs.baseProfile || 'full';
			attrs.width = attrs.width || '100%';
			attrs.height = attrs.height || '100%';
			if(attrs.width !== '100%' && attrs.height != '100%') {
				attrs.viewbox = '0 0 ' + attrs.width + ' ' + attrs.height;
			}
			attrs.xmlns = attrs.xmlns || 'http://www.w3.org/2000/svg';
			attrs['xmlns:xlink'] = attrs['xmlns:xlink'] || 'http://www.w3.org/1999/xlink';
			attrs['xmlns:ev']  = attrs['xmlns:ev'] || 'http://www.w3.org/2001/xml-events';
			attrs.style = attrs.style || lastDefined('font') + ';' + globalStyle;
			function toAttr(obj){
				function toKeyValue(key){ return key + '="' + obj[key] + '"' }
				return Object.keys(obj).map(toKeyValue).join(' ')
			}
			function toHtml(e){
				return '<'+e.name+' '+toAttr(e.attr)+'>'+(e.content || '')+'</'+e.name+'>'
			}
			var innerSvg = elements.map(toHtml).join('\n')
			return toHtml(Element('svg', attrs, innerSvg))
		}
	}
};
