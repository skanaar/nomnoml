import { Config, RelationLabel, TextStyle } from './domain'
import { Graphics } from './Graphics'
import { LayoutedAssoc, LayoutedNode, LayoutedPart } from './layouter'
import { drawTerminators, getPath } from './terminators'
import { last } from './util'
import { add, Vec } from './vector'
import { buildStyle, styles, visualizers } from './visuals'

export function render(graphics: Graphics, config: Config, compartment: LayoutedPart) {
  const g = graphics

  function renderCompartment(
    compartment: LayoutedPart,
    color: string | undefined,
    style: TextStyle,
    level: number
  ) {
    g.save()
    g.translate(compartment.offset!.x, compartment.offset!.y)
    g.fillStyle(color || config.stroke)
    for (let i = 0; i < compartment.lines.length; i++) {
      const text = compartment.lines[i]
      g.textAlign(style.center ? 'center' : 'left')
      const x = style.center ? compartment.width! / 2 - config.padding : 0
      let y = (0.5 + (i + 0.5) * config.leading) * config.fontSize
      if (text) {
        g.fillText(text, x, y)
      }
      if (style.underline) {
        const w = g.measureText(text).width
        y += Math.round(config.fontSize * 0.2) + 0.5
        if (style.center) {
          g.path([
            { x: x - w / 2, y: y },
            { x: x + w / 2, y: y },
          ]).stroke()
        } else {
          g.path([
            { x: x, y: y },
            { x: x + w, y: y },
          ]).stroke()
        }
        g.lineWidth(config.lineWidth)
      }
    }
    g.save()
    g.translate(config.gutter, config.gutter)
    for (const r of compartment.assocs) renderRelation(r)
    for (const n of compartment.nodes) renderNode(n, level)
    g.restore()
    g.restore()
  }

  function renderNode(node: LayoutedNode, level: number) {
    const x = node.x - node.width / 2
    const y = node.y - node.height / 2
    const style = config.styles[node.type] || styles.class

    g.save()
    g.setData('name', node.id)

    g.save()
    g.fillStyle(style.fill || config.fill[level] || last(config.fill))
    g.strokeStyle(style.stroke || config.stroke)
    if (style.dashed) {
      const dash = Math.max(4, 2 * config.lineWidth)
      g.setLineDash([dash, dash])
    }
    const drawNode = visualizers[style.visual] || visualizers.class
    drawNode(node, x, y, config, g)
    for (const divider of node.dividers!) {
      g.path(divider.map((e) => add(e, { x, y }))).stroke()
    }
    g.restore()

    for (let part of node.parts) {
      const textStyle = part === node.parts[0] ? style.title : style.body
      g.save()
      g.translate(x + part.x!, y + part.y!)
      g.setFont(
        config.font,
        config.fontSize,
        textStyle.bold ? 'bold' : 'normal',
        textStyle.italic ? 'italic' : 'normal'
      )
      renderCompartment(part, style.stroke, textStyle, level + 1)
      g.restore()
    }

    g.restore()
  }

  function strokePath(p: Vec[]) {
    if (config.edges === 'rounded') {
      const radius = config.spacing * config.bendSize
      g.beginPath()
      g.moveTo(p[0].x, p[0].y)

      for (let i = 1; i < p.length - 1; i++) {
        g.arcTo(p[i].x, p[i].y, p[i + 1].x, p[i + 1].y, radius)
      }
      g.lineTo(last(p).x, last(p).y)
      g.stroke()
    } else g.path(p).stroke()
  }

  function renderLabel(label: RelationLabel) {
    if (!label || !label.text) return
    const fontSize = config.fontSize
    const lines = label.text.split('`')
    for (let i = 0; i < lines.length; i++) {
      g.fillText(lines[i], label.x!, label.y! + fontSize * (i + 1))
    }
  }

  function renderRelation(r: LayoutedAssoc) {
    const path = getPath(config, r)

    g.fillStyle(config.stroke)
    g.setFont(config.font, config.fontSize, 'normal', 'normal')

    renderLabel(r.startLabel)
    renderLabel(r.endLabel)

    if (r.type !== '-/-') {
      if (r.type.includes('--')) {
        const dash = Math.max(4, 2 * config.lineWidth)
        g.save()
        g.setLineDash([dash, dash])
        strokePath(path)
        g.restore()
      } else strokePath(path)
    }

    drawTerminators(g, config, r)
  }

  function setBackground() {
    g.clear()
    g.save()
    g.strokeStyle('transparent')
    g.fillStyle(config.background)
    g.rect(0, 0, compartment.width!, compartment.height!).fill()
    g.restore()
  }

  g.save()
  g.scale(config.zoom, config.zoom)
  setBackground()
  g.setFont(config.font, config.fontSize, 'bold', 'normal')
  g.lineWidth(config.lineWidth)
  g.lineJoin('round')
  g.lineCap('round')
  g.strokeStyle(config.stroke)
  renderCompartment(compartment, undefined, buildStyle({}, {}).title, 0)
  g.restore()
}
