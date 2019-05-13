namespace nomnoml.skanaar {

	interface SvgState {
		x: number
		y: number
		stroke: string|null
		dashArray: string|null
		fill: string|null
		textAlign: string|null
		font: string|null
	}

	interface SvgGraphics extends Graphics {
		serialize(_attributes: any): string
	}

  export function Svg(globalStyle: string, canvas?: HTMLCanvasElement): SvgGraphics {
		var initialState: SvgState = {
			x: 0,
			y: 0,
			stroke: 'none',
			dashArray: 'none',
			fill: 'none',
			textAlign: 'left',
			font: null
		}
		var states = [initialState]
		var elements: any[] = []

		// canvas is an optional parameter
		var ctx = canvas ? canvas.getContext('2d') : null
		var canUseCanvas = false
		var waitingForFirstFont = true
		var docFont = ''

		function Element(name: string, attr: any, content?: string): any {
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

		function State(dx: number, dy: number): SvgState {
			return { x: dx, y: dy, stroke: null, fill: null, textAlign: null, dashArray:'none', font: null }
		}

		function trans(coord: number, axis: 'x'|'y'){
			states.forEach(function (t){ coord += t[axis] })
			return coord
		}
		function tX(coord: number){ return Math.round(10*trans(coord, 'x'))/10 }
		function tY(coord: number){ return Math.round(10*trans(coord, 'y'))/10 }
		function lastDefined(property: keyof SvgState): any {
			for(var i=states.length-1; i>=0; i--)
				if (states[i][property])
					return states[i][property]
			return undefined
		}

		function last<T>(list: T[]): T { return list[list.length-1] }

		function tracePath(path: Vec[], offset?: Vec, s?: number): Chainable {
			s = s === undefined ? 1 : s
			offset = offset || {x:0, y:0}
			var d = path.map(function (e, i){
				return (i ? 'L' : 'M') + tX(offset.x + s*e.x) + ' ' + tY(offset.y + s*e.y)
			}).join(' ')
			return newElement('path', { d: d })
		}

		function newElement(type: string, attr: any, content?: string) {
			var element = Element(type, attr, content)
			elements.push(element)
			return element
		}

		return {
			width: function (){ return 0 },
			height: function (){ return 0 },
			background: function (/*r, g, b*/){},
			clear: function (){},
			circle: function (p: Vec, r: number){
				var element = Element('circle', {r: r, cx: tX(p.x), cy: tY(p.y)})
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
				var element = tracePath(path, offset, s) as any
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
				var attr = { x: tX(x), y: tY(y), style: '' }
				var font = lastDefined('font')
				if (font.indexOf('bold') === -1) {
					attr.style = 'font-weight:normal;'
				}
				if (font.indexOf('italic') > -1) {
					attr.style += 'font-style:italic;'
				}
				if (lastDefined('textAlign') === 'center') {
					attr.style += 'text-anchor: middle;'
				}
				function escapeHtml(unsafe: string) {
					return unsafe
						.replace(/&/g, '&amp;')
						.replace(/</g, '&lt;')
						.replace(/>/g, '&gt;')
						.replace(/"/g, '&quot;')
						.replace(/'/g, '&#039;');
				}
				return newElement('text', attr, escapeHtml(text))
			},
			lineCap: function (cap){ globalStyle += ';stroke-linecap:'+cap; return last(elements) },
			lineJoin: function (join){ globalStyle += ';stroke-linejoin:'+join; return last(elements) },
			lineTo: function (x, y){
				last(elements).attr.d += ('L' + tX(x) + ' ' + tY(y) + ' ')
				 return last(elements)
			},
			lineWidth: function (w){ globalStyle += ';stroke-width:'+w; return last(elements)},
			measureText: function (s: string){
				if (canUseCanvas) {
					var fontStr = lastDefined('font')
					var italicSpec = (/\bitalic\b/.test(fontStr) ? 'italic' : 'normal') + ' normal '
					var boldSpec = /\bbold\b/.test(fontStr) ? 'bold ' : 'normal '
					ctx.font = italicSpec + boldSpec + docFont
					return ctx.measureText(s)
				} else {
					return {
						width: skanaar.sum(s, function (c: string){
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
			serialize: function (_attributes: any): string {
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
				function toAttr(obj: any){
					function toKeyValue(key: string){ return key + '="' + obj[key] + '"' }
					return Object.keys(obj).map(toKeyValue).join(' ')
				}
				function toHtml(e: any){
					return '<'+e.name+' '+toAttr(e.attr)+'>'+(e.content || '')+'</'+e.name+'>'
				}
				var innerSvg = elements.map(toHtml).join('\n')
				return toHtml(Element('svg', attrs, innerSvg))
			}
		}
	}
}
