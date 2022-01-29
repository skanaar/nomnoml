import { Chainable, Graphics, Vector } from "./Graphics"
import { range, sum } from "./util"
import { add } from "./vector"

interface SvgState {
	x: number
	y: number
	stroke: string|null
	strokeWidth: number|null
	dashArray: string|null
	fill: string|null
	textAlign: string|null
	font: string|null
	fontSize: number|null
	attributes: any|null
}

interface ISvgGraphics extends Graphics {
	serialize(size: { width: number, height: number }, code: string, title: string): string
}

function xmlEncode(str: any) {
	return (str ?? '').toString()
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;')
}

export var charWidths: { [key: string]: number } = {"0":10,"1":10,"2":10,"3":10,"4":10,"5":10,"6":10,"7":10,"8":10,"9":10," ":5,"!":5,"\"":6,"#":10,"$":10,"%":15,"&":11,"'":4,"(":6,")":6,"*":7,"+":10,",":5,"-":6,".":5,"/":5,":":5,";":5,"<":10,"=":10,">":10,"?":10,"@":17,"A":11,"B":11,"C":12,"D":12,"E":11,"F":10,"G":13,"H":12,"I":5,"J":9,"K":11,"L":10,"M":14,"N":12,"O":13,"P":11,"Q":13,"R":12,"S":11,"T":10,"U":12,"V":11,"W":16,"X":11,"Y":11,"Z":10,"[":5,"\\":5,"]":5,"^":8,"_":10,"`":6,"a":10,"b":10,"c":9,"d":10,"e":10,"f":5,"g":10,"h":10,"i":4,"j":4,"k":9,"l":4,"m":14,"n":10,"o":10,"p":10,"q":10,"r":6,"s":9,"t":5,"u":10,"v":9,"w":12,"x":9,"y":9,"z":9,"{":6,"|":5,"}":6,"~":10}

export function GraphicsSvg(globalStyle: string, document?: HTMLDocument): ISvgGraphics {
	var initialState: SvgState = {
		x: 0,
		y: 0,
		stroke: 'none',
		strokeWidth: 1,
		dashArray: 'none',
		fill: 'none',
		textAlign: 'left',
		font: 'Helvetica, Arial, sans-serif',
		fontSize: 12,
		attributes: {}
	}
	var states = [initialState]
	var elements: Element[] = []

	var measurementCanvas: HTMLCanvasElement|null = document ? document.createElement('canvas') : null;
	var ctx = measurementCanvas ? measurementCanvas.getContext('2d') : null

	class Element {
		constructor(name: string, attr: any, content?: string) {
			this.name = name
			this.attr = attr
			this.content = content || undefined
		}
		name: string
		attr: any
		content: string|undefined
		stroke(){
			var base = this.attr.style || ''
			this.attr.style = base +
				'stroke:'+lastDefined('stroke')+
				';fill:none'+
				';stroke-dasharray:' + lastDefined('dashArray') +
				';stroke-width:' + lastDefined('strokeWidth') + ';';
			return this
		}
		fill(){
			var base = this.attr.style || ''
			this.attr.style = base + 'stroke:none; fill:'+lastDefined('fill')+';';
			return this
		}
		fillAndStroke(){
			var base = this.attr.style || ''
			this.attr.style = base +
				'stroke:'+lastDefined('stroke')+
				';fill:'+lastDefined('fill')+
				';stroke-dasharray:' + lastDefined('dashArray') + 
				';stroke-width:' + lastDefined('strokeWidth') +';';
			return this
		}
	}

	function State(dx: number, dy: number): SvgState {
		return {
			x: dx,
			y: dy,
			stroke: null,
			strokeWidth: null,
			fill: null,
			textAlign: null,
			dashArray:'none',
			font: null,
			fontSize: null,
			attributes: null
		}
	}

	function trans(coord: number, axis: 'x'|'y'){
		states.forEach(function (t){ coord += t[axis] })
		return coord
	}
	function tX(coord: number){ return Math.round(10*trans(coord, 'x'))/10 }
	function tY(coord: number){ return Math.round(10*trans(coord, 'y'))/10 }
	function lastDefined(property: keyof SvgState): string|number|any {
		for(var i=states.length-1; i>=0; i--)
			if (states[i][property])
				return states[i][property]
		return undefined
	}

	function last<T>(list: T[]): T { return list[list.length-1] }

	function tracePath(path: Vector[], offset: Vector = {x:0, y:0}, s: number = 1): Chainable {
		var d = path.map(function (e, i){
			return (i ? 'L' : 'M') + tX(offset.x + s*e.x) + ' ' + tY(offset.y + s*e.y)
		}).join(' ')
		return newElement('path', { d: d })
	}

	function newElement(type: string, attr: any, content?: string) {
		var element = new Element(type, attr, content)
		var extraData = lastDefined('attributes')
		for(var key in extraData) {
			element.attr['data-'+key] = extraData[key]
		}
		elements.push(element)
		return element
	}

	return {
		width: function (){ return 0 },
		height: function (){ return 0 },
		clear: function (){},
		circle: function (p: Vector, r: number){
			return newElement('circle', {r: r, cx: tX(p.x), cy: tY(p.y)})
		},
		ellipse: function (center, w, h, start = 0, stop = 0){
			if (start || stop) {
				var path = range([start, stop], 64).map(a =>
					add(center, { x: Math.cos(a) * w/2, y: Math.sin(a) * h/2 })
				)
				return tracePath(path)
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
		setFont: function (font: string, bold: 'bold'|'normal', ital:'italic'|null, fontSize: number): void {
			var font = `${bold} ${ital || ''} ${fontSize}pt ${font}, Helvetica, sans-serif`
			last(states).font = font;
			last(states).fontSize = fontSize;
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
			var attr = { x: tX(x), y: tY(y), style: 'fill: '+last(states).fill+';' }
			var font = lastDefined('font')
			if (font) {
				attr.style += 'font:'+font+';'
			}
			if (lastDefined('textAlign') === 'center') {
				attr.style += 'text-anchor: middle;'
			}
			return newElement('text', attr, text)
		},
		lineCap: function (cap){ globalStyle += ';stroke-linecap:'+cap },
		lineJoin: function (join){ globalStyle += ';stroke-linejoin:'+join },
		lineTo: function (x, y){
			last(elements).attr.d += ('L' + tX(x) + ' ' + tY(y) + ' ')
				return last(elements)
		},
		lineWidth: function (w){
			last(states).strokeWidth = w
		},
		measureText: function (s: string){
			if (ctx) {
				// use supplied canvas to measure text
				ctx.font = lastDefined('font') || 'normal 12pt Helvetica'
				return ctx.measureText(s)
			} else {
				// use heuristic to measure text
				return {
					width: sum(s, function (c: string){
						var scale = lastDefined('fontSize')/12
						if (charWidths[c]) { return charWidths[c] * scale }
						return 16 * scale // non-ascii characters all treated as wide
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
		setData: function (name: string, value: string) {
			lastDefined('attributes')[name] = value
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
		serialize: function (size: { width: number, height: number }, desc: string, title: string): string {
			function toAttr(obj: any){
				return Object.keys(obj).map(key => `${key}="${xmlEncode(obj[key])}"`).join(' ')
			}
			function toHtml(e: Element){
				return `<${e.name} ${toAttr(e.attr)}>${xmlEncode(e.content)}</${e.name}>`
			}

			var elementsToSerialize = elements

			if(desc){
				elementsToSerialize.unshift(new Element('desc', {}, desc))
			}
			if(title) {
				elementsToSerialize.unshift(new Element('title', {}, title))
			}

			var innerSvg = elementsToSerialize.map(toHtml).join('\n  ')

			var attrs = {
				version: '1.1',
				baseProfile: 'full',
				width: size.width,
				height: size.height,
				viewbox: '0 0 ' + size.width + ' ' + size.height,
				xmlns: 'http://www.w3.org/2000/svg',
				'xmlns:xlink': 'http://www.w3.org/1999/xlink',
				'xmlns:ev': 'http://www.w3.org/2001/xml-events',
				style: 'font:'+lastDefined('font') + ';' + globalStyle,
			}
			return '<svg '+toAttr(attrs)+'>\n  '+innerSvg+'\n</svg>'
		}
	}
}
