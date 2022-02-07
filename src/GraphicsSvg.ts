import { Chainable, Graphics, Vector } from "./Graphics"
import { last, range, sum } from "./util"
import { add } from "./vector"

interface SvgAttr {
	transform?: string
	stroke?: string
	'stroke-width'?: number
	'stroke-dasharray'?: string
	'stroke-linejoin'?: string
	'stroke-linecap'?: string
	fill?: string
	'text-align'?: string
	font?: string
	'font-size'?: string
	'font-weight'?: 'bold'|'normal'
	'font-family'?: string
	'font-style'?: 'italic'|'normal'
}

interface ISvgGraphics extends Graphics {
	serialize(size: { width: number, height: number }, code: string, title: string): string
}

function toAttrString(obj: Record<string, undefined|string|number>): string {
	return Object
	.entries(obj)
	.filter(([_, val]) => val !== undefined)
	.map(([key, val]) => `${key}="${xmlEncode(val)}"`)
	.join(' ')
}

function xmlEncode(str: any) {
	if ('number' === typeof str)
		return str.toFixed(1)
	return (str ?? '').toString()
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;')
}

export var charWidths: { [key: string]: number } = {"0":10,"1":10,"2":10,"3":10,"4":10,"5":10,"6":10,"7":10,"8":10,"9":10," ":5,"!":5,"\"":6,"#":10,"$":10,"%":15,"&":11,"'":4,"(":6,")":6,"*":7,"+":10,",":5,"-":6,".":5,"/":5,":":5,";":5,"<":10,"=":10,">":10,"?":10,"@":17,"A":11,"B":11,"C":12,"D":12,"E":11,"F":10,"G":13,"H":12,"I":5,"J":9,"K":11,"L":10,"M":14,"N":12,"O":13,"P":11,"Q":13,"R":12,"S":11,"T":10,"U":12,"V":11,"W":16,"X":11,"Y":11,"Z":10,"[":5,"\\":5,"]":5,"^":8,"_":10,"`":6,"a":10,"b":10,"c":9,"d":10,"e":10,"f":5,"g":10,"h":10,"i":4,"j":4,"k":9,"l":4,"m":14,"n":10,"o":10,"p":10,"q":10,"r":6,"s":9,"t":5,"u":10,"v":9,"w":12,"x":9,"y":9,"z":9,"{":6,"|":5,"}":6,"~":10}

export function GraphicsSvg(document?: HTMLDocument): ISvgGraphics {
	var initialState: SvgAttr = {
		stroke: undefined,
		'stroke-width': 1,
		'stroke-dasharray': undefined,
		'stroke-linecap': undefined,
		'stroke-linejoin': undefined,
		'text-align': 'left',
		font: '12pt Helvetica, Arial, sans-serif',
		'font-size': '12pt',
	}

	var measurementCanvas: HTMLCanvasElement|null = document ? document.createElement('canvas') : null
	var ctx = measurementCanvas ? measurementCanvas.getContext('2d') : null

	type SvgElement = 'svg'|'g'|'path'|'ellipse'|'circle'|'rect'|'text'|'desc'|'title';
	class Element {
		constructor(name: SvgElement, attr: Record<string, string|number>, parent: GroupElement|undefined, text?: string) {
			this.name = name
			this.attr = attr
			this.parent = parent
			this.children = []
			this.text = text || undefined
		}
		name: string
		attr: any
		parent: GroupElement|undefined
		children: Element[]
		text: string|undefined
		elideEmpty = false
		stroke(){
			this.attr.fill = 'none'
			return this
		}
		fill(){
			this.attr.stroke = 'none'
			return this
		}
		fillAndStroke(){
			return this
		}
		group() {
			return this.parent
		}
		serialize(): string {
			const data = getDefined(this.group(), e => e.data) ?? {}
			const attrs = toAttrString({ ...this.attr, ...data })
			const content = this.children.map(o => o.serialize()).join('\n')
			if (this.name === 'text')
				return `<text ${attrs}>${xmlEncode(this.text)}</text>`
			else if (this.children.length === 0)
				return this.elideEmpty ? '' : `<${this.name} ${attrs}></${this.name}>`
			else
				return `<${this.name} ${attrs}>
	${content.replace(/\n/g, '\n\t')}
</${this.name}>`
		}
	}

	function getDefined<T>(group: GroupElement|undefined, getter: (e: GroupElement) => T|undefined): T|undefined {
		if (!group) return getter(syntheticRoot)
		return getter(group) ?? getDefined<T>(group.parent, getter) ?? getter(syntheticRoot)
	}
	
	class GroupElement extends Element {
		constructor(parent: GroupElement) {
			super('g', {}, parent)
		}
		elideEmpty = true
		attr: SvgAttr
		data: Record<string, string>
		group() {
			return this
		}
	}
	
	const syntheticRoot = new GroupElement({} as GroupElement)
	syntheticRoot.attr = initialState

	var root: Element = new Element('svg', {
		version: '1.1',
		baseProfile: 'full',
		xmlns: 'http://www.w3.org/2000/svg',
		'xmlns:xlink': 'http://www.w3.org/1999/xlink',
		'xmlns:ev': 'http://www.w3.org/2001/xml-events',
	}, undefined)
	var current: GroupElement = new GroupElement(root as GroupElement)
	current.attr = initialState
	root.children.push(current)
	var inPathBuilderMode = false

	function tracePath(path: Vector[], offset: Vector = {x:0, y:0}, s: number = 1): Chainable {
		var d = path.map(function (e, i){
			return (i ? 'L' : 'M') + (offset.x + s*e.x).toFixed(1) + ' ' + (offset.y + s*e.y).toFixed(1)
		}).join(' ')
		return el('path', { d: d })
	}

	function el(type: SvgElement, attr: any, text?: string) {
		var element = new Element(type, attr, current, text)
		current.children.push(element)
		return element
	}

	return {
		width: function (){ return 0 },
		height: function (){ return 0 },
		clear: function (){},
		circle: function (p: Vector, r: number){
			return el('circle', { r: r, cx: p.x, cy: p.y })
		},
		ellipse: function (center, w, h, start = 0, stop = 0){
			if (start || stop) {
				var path = range([start, stop], 64).map(a =>
					add(center, { x: Math.cos(a) * w/2, y: Math.sin(a) * h/2 })
				)
				return tracePath(path)
			} else {
				return el('ellipse', { cx: center.x, cy: center.y, rx: w/2, ry: h/2 })
			}
		},
		arc: function (cx, cy, r /*, start, stop*/){
			return el('ellipse', { cx, cy, rx: r, ry: r })
		},
		roundRect: function (x, y, width, height, r){
			return el('rect', { x, y, rx: r, ry: r, height, width })
		},
		rect: function (x, y, width, height){
			return el('rect', { x, y, height, width })
		},
		path: tracePath,
		circuit: function (path, offset, s){
			var element = tracePath(path, offset, s) as any
			element.attr.d += ' Z'
			return element
		},
		setFont: function (family: string, size: number, weight: 'bold'|'normal', style:'italic'|'normal'): void {
			current.attr['font-family'] = family
			current.attr['font-size'] = size+'pt'
			current.attr['font-weight'] = weight
			current.attr['font-style'] = style
		},
		strokeStyle: function (stroke){
			current.attr.stroke = stroke
		},
		fillStyle: function (fill){
			current.attr.fill = fill
		},
		arcTo: function (x1, y1, x2, y2){
			if (inPathBuilderMode)
				last(current.children).attr.d += ('L'+x1+' '+y1+' L'+x2+' '+y2+' ')
			else
				throw new Error('can only be called after .beginPath()')
		},
		beginPath: function (){
			inPathBuilderMode = true
			return el('path', {d:''})
		},
		fillText: function (text, x, y){
			return el('text', {
				x,
				y,
				stroke: 'none',
				font: undefined as undefined|string, style: undefined as undefined|string,
				'text-anchor': getDefined(current, e => e.attr['text-align']) === 'center' ? 'middle' : undefined
			}, text)
		},
		lineCap: function (cap){ current.attr['stroke-linecap'] = cap },
		lineJoin: function (join){ current.attr['stroke-linejoin'] = join },
		lineTo: function (x, y){
			if (inPathBuilderMode)
				last(current.children).attr.d += ('L' + (x).toFixed(1) + ' ' + (y).toFixed(1) + ' ')
			else
				throw new Error('can only be called after .beginPath()')
			return current
		},
		lineWidth: function (w){
			current.attr['stroke-width'] = w
		},
		measureText: function (s: string){
			if (ctx) {
				// use supplied canvas to measure text
				if (current)
					ctx.font = `${getDefined(current, e => e.attr["font-weight"])} ${getDefined(current, e => e.attr["font-style"])} ${getDefined(current, e => e.attr["font-size"])} ${getDefined(current, e => e.attr["font-family"])}`
				else
					ctx.font = `${initialState["font-weight"]} ${initialState["font-style"]} ${initialState["font-size"]} ${initialState["font-family"]}`
				return ctx.measureText(s)
			} else {
				// use heuristic to measure text
				return {
					width: sum(s, function (c: string){
						const size = getDefined(current, e => e.attr['font-size']) ?? 12
						var scale = parseInt(size.toString())/12
						// non-ascii characters all treated as wide
						return (charWidths[c] ?? 16) * scale
					})
				}
			}
		},
		moveTo: function (x, y){
			if (inPathBuilderMode)
				last(current.children).attr.d += ('M' + (x).toFixed(1) + ' ' + (y).toFixed(1) + ' ')
			else
				throw new Error('can only be called after .beginPath()')
		},
		restore: function (){
			if (current.parent) current = current.parent
		},
		save: function (){
			var node = new GroupElement(current)
			current.children.push(node)
			current = node
		},
		setData: function (name: string, value: string) {
			current.data = current.data ?? {}
			current.data['data-'+name] = value
		},
		scale: function (){},
		setLineDash: function (d){
			current.attr['stroke-dasharray'] = (d.length === 0) ? 'none' : d[0] + ' ' + d[1]
		},
		stroke: function (){
			inPathBuilderMode = false
			last(current.children).stroke()
		},
		textAlign: function (a){
			current.attr['text-align'] = a
		},
		translate: function (dx, dy){
			current.attr.transform = `translate(${dx}, ${dy})`
		},
		serialize: function (size: { width: number, height: number }, desc: string, title: string): string {
			if(desc){
				root.children.unshift(new Element('desc', {}, undefined, desc))
			}
			if(title) {
				root.children.unshift(new Element('title', {}, undefined, title))
			}

			root.attr = {
				version: '1.1',
				baseProfile: 'full',
				width: size.width,
				height: size.height,
				viewbox: '0 0 ' + size.width + ' ' + size.height,
				xmlns: 'http://www.w3.org/2000/svg',
				'xmlns:xlink': 'http://www.w3.org/1999/xlink',
				'xmlns:ev': 'http://www.w3.org/2001/xml-events',
			}
			return root.serialize()
		}
	}
}
