import { Classifier, Compartment, Config, Relation, RelationLabel, TextStyle } from "./domain"
import { Graphics } from "./Graphics"
import { drawTerminators, getPath } from "./terminators"
import { hasSubstring, last } from "./util"
import { add, Vec } from "./vector"
import { buildStyle, styles, visualizers } from "./visuals"

export function render(graphics: Graphics, config: Config, compartment: Compartment){

	var g = graphics

	function renderCompartment(compartment: Compartment, color: string|undefined, style: TextStyle, level: number){
		g.save()
		g.translate(compartment.offset.x, compartment.offset.y)
		g.fillStyle(color || config.stroke)
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
				if (style.center){
					g.path([{x:x-w/2, y:y}, {x:x+w/2, y:y}]).stroke()
				} else {
					g.path([{x:x, y:y}, {x:x+w, y:y}]).stroke()
				}
				g.lineWidth(config.lineWidth)
			}
		})
		g.save()
		g.translate(config.gutter, config.gutter)
		compartment.relations.forEach(function (r){ renderRelation(r) })
		compartment.nodes.forEach(function (n){ renderNode(n, level) })
		g.restore()
		g.restore()
	}

	function renderNode(node: Classifier, level: number){
		var x = Math.round(node.x-node.width/2)
		var y = Math.round(node.y-node.height/2)
		var style = config.styles[node.type] || styles.CLASS

		g.save()
		g.fillStyle(style.fill || config.fill[level] || last(config.fill))
		g.strokeStyle(style.stroke || config.stroke)
		if (style.dashed){
			var dash = Math.max(4, 2*config.lineWidth)
			g.setLineDash([dash, dash])
		}
		g.setData('name', node.name)
		var drawNode = visualizers[style.visual] || visualizers.class
		drawNode(node, x, y, config, g)
		for(var divider of node.dividers) {
			g.path(divider.map(e => add(e, { x, y }))).stroke()
		}
		g.restore()

		g.save()
		g.translate(x, y)

		node.compartments.forEach(function (part: Compartment, i: number){
			var textStyle = i == 0 ? style.title : style.body;
			g.save()
			g.translate(part.x, part.y)
			g.setFont(config.font, config.fontSize, textStyle.bold ? 'bold' : 'normal', textStyle.italic ? 'italic' : 'normal')
			renderCompartment(part, style.stroke, textStyle, level+1)
			g.restore()
		})
		
		g.restore()
	}

	function strokePath(p: Vec[]){
		if (config.edges === 'rounded'){
			var radius = config.spacing * config.bendSize
			g.beginPath()
			g.moveTo(p[0].x, p[0].y)

			for (var i = 1; i < p.length-1; i++){
				g.arcTo(p[i].x, p[i].y, p[i+1].x, p[i+1].y, radius)
			}
			g.lineTo(last(p).x, last(p).y)
			g.stroke()
		}
		else
			g.path(p).stroke()
	}

	function renderLabel(label: RelationLabel){
		if (!label || !label.text) return
		var fontSize = config.fontSize
		var lines = label.text.split('`')
		lines.forEach((l, i) => g.fillText(l, label.x!, label.y! + fontSize*(i+1)))
	}

	function renderRelation(r: Relation){
		var path = getPath(config, r)
		
		g.fillStyle(config.stroke)
		g.setFont(config.font, config.fontSize, 'normal', 'normal')

		renderLabel(r.startLabel)
		renderLabel(r.endLabel)

		if (r.assoc !== '-/-' && r.assoc !== '_/_'){
			if (hasSubstring(r.assoc, '--') || hasSubstring(r.assoc, '__')){
				var dash = Math.max(4, 2*config.lineWidth)
				g.save()
				g.setLineDash([dash, dash])
				strokePath(path)
				g.restore()
			}
			else
				strokePath(path)
		}
		
		drawTerminators(g, config, r)
	}

	function snapToPixels(){
		if (config.lineWidth % 2 === 1)
			g.translate(0.5, 0.5) // TODO remove, Hi Res displays are common
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
	snapToPixels()
	setBackground()
	g.setFont(config.font, config.fontSize, 'bold', 'normal')
	g.lineWidth(config.lineWidth)
	g.lineJoin('round')
	g.lineCap('round')
	g.strokeStyle(config.stroke)
	renderCompartment(compartment, undefined, buildStyle({}, {}).title, 0)
	g.restore()
}
