import { Config, NodeLayouter, Style, TextStyle, Visual, Visualizer } from './domain'
import { LayoutedNode, LayoutedPart } from './layouter'
import { sum, last, range } from './util'
import { Vec } from './vector'

export function buildStyle(
  conf: Partial<Style>,
  title: Partial<TextStyle>,
  body: Partial<TextStyle> = {}
): Style {
  return {
    title: {
      bold: title.bold || false,
      underline: title.underline || false,
      italic: title.italic || false,
      center: title.center || false,
    },
    body: {
      bold: body.bold || false,
      underline: body.underline || false,
      italic: body.italic || false,
      center: body.center || false,
    },
    dashed: conf.dashed || false,
    fill: conf.fill || undefined,
    stroke: conf.stroke || undefined,
    visual: conf.visual || 'class',
    direction: conf.direction || undefined,
  }
}

// prettier-ignore
export var styles: { [key: string]: Style } = {
  abstract:    buildStyle({ visual:'class' }, { center:true, italic:true }),
  actor:       buildStyle({ visual:'actor' }, { center:true }, { center: true }),
  choice:      buildStyle({ visual:'rhomb' }, { center:true }, { center: true }),
  class:       buildStyle({ visual:'class' }, { center:true, bold:true }),
  database:    buildStyle({ visual:'database' }, { center:true, bold:true }, { center: true }),
  end:         buildStyle({ visual:'end' }, {}),
  frame:       buildStyle({ visual:'frame' }, {}),
  hidden:      buildStyle({ visual:'hidden' }, {}),
  input:       buildStyle({ visual:'input' }, { center:true }),
  instance:    buildStyle({ visual:'class' }, { center:true, underline:true }),
  label:       buildStyle({ visual:'none' }, { center:true }),
  lollipop:    buildStyle({ visual:'lollipop' }, { center:true }),
  note:        buildStyle({ visual:'note' }, {}),
  pipe:        buildStyle({ visual:'pipe' }, { center:true, bold: true }),
  package:     buildStyle({ visual:'package' }, {}),
  receiver:    buildStyle({ visual:'receiver' }, {}),
  reference:   buildStyle({ visual:'class', dashed:true }, { center:true }),
  sender:      buildStyle({ visual:'sender' }, {}),
  socket:      buildStyle({ visual:'socket' }, {}),
  start:       buildStyle({ visual:'start' }, {}),
  state:       buildStyle({ visual:'roundrect' }, { center:true }),
  sync:        buildStyle({ visual:'sync' }, { center:true }),
  table:       buildStyle({ visual:'table' }, { center:true, bold:true }),
  transceiver: buildStyle({ visual:'transceiver' }, {}),
  usecase:     buildStyle({ visual:'ellipse' }, { center:true }, { center: true }),
}

function offsetBox(config: Config, clas: LayoutedNode, offset: Vec) {
  clas.width = Math.max(...clas.parts.map((e) => e.width ?? 0))
  clas.height = sum(clas.parts, (e) => e.height ?? 0 ?? 0)
  clas.dividers = []
  var y = 0
  for (var comp of clas.parts) {
    comp.x = 0 + offset.x
    comp.y = y + offset.y
    comp.width = clas.width
    y += comp.height ?? 0 ?? 0
    if (comp != last(clas.parts))
      clas.dividers.push([
        { x: 0, y: y },
        { x: clas.width, y: y },
      ])
  }
}
function box(config: Config, clas: LayoutedNode) {
  offsetBox(config, clas, { x: 0, y: 0 })
}

function icon(config: Config, clas: LayoutedNode) {
  clas.dividers = []
  clas.parts = []
  clas.width = config.fontSize * 2.5
  clas.height = config.fontSize * 2.5
}

function labelledIcon(config: Config, clas: LayoutedNode) {
  clas.width = config.fontSize * 1.5
  clas.height = config.fontSize * 1.5
  clas.dividers = []
  var y = config.direction == 'LR' ? clas.height - config.padding : -clas.height / 2
  for (var comp of clas.parts) {
    if (config.direction == 'LR') {
      comp.x = clas.width / 2 - (comp.width ?? 0) / 2
      comp.y = y
    } else {
      comp.x = clas.width / 2 + config.padding / 2
      comp.y = y
    }
    y += comp.height ?? 0 ?? 0
  }
}

export var layouters: { [key in Visual]: NodeLayouter } = {
  actor: function (config: Config, clas: LayoutedNode) {
    clas.width = Math.max(config.padding * 2, ...clas.parts.map((e) => e.width ?? 0))
    clas.height = config.padding * 3 + sum(clas.parts, (e) => e.height ?? 0)
    clas.dividers = []
    var y = config.padding * 3
    for (var comp of clas.parts) {
      comp.x = 0
      comp.y = y
      comp.width = clas.width
      y += comp.height ?? 0
      if (comp != last(clas.parts))
        clas.dividers.push([
          { x: config.padding, y: y },
          { x: clas.width - config.padding, y: y },
        ])
    }
  },
  class: box,
  database: function (config: Config, clas: LayoutedNode) {
    clas.width = Math.max(...clas.parts.map((e) => e.width ?? 0))
    clas.height = sum(clas.parts, (e) => e.height ?? 0) + config.padding * 2
    clas.dividers = []
    var y = config.padding * 1.5
    for (var comp of clas.parts) {
      comp.x = 0
      comp.y = y
      comp.width = clas.width
      y += comp.height ?? 0
      if (comp != last(clas.parts)) {
        var path = range([0, Math.PI], 16).map((a) => ({
          x: clas.width * 0.5 * (1 - Math.cos(a)),
          y: y + config.padding * (0.75 * Math.sin(a) - 0.5),
        }))
        clas.dividers.push(path)
      }
    }
  },
  ellipse: function (config: Config, clas: LayoutedNode) {
    var width = Math.max(...clas.parts.map((e) => e.width ?? 0))
    var height = sum(clas.parts, (e) => e.height ?? 0)
    clas.width = width * 1.25
    clas.height = height * 1.25
    clas.dividers = []
    var y = height * 0.125
    var sq = (x: number) => x * x
    var rimPos = (y: number) => Math.sqrt(sq(0.5) - sq(y / clas.height - 0.5)) * clas.width
    for (var comp of clas.parts) {
      comp.x = width * 0.125
      comp.y = y
      comp.width = width
      y += comp.height ?? 0
      if (comp != last(clas.parts))
        clas.dividers.push([
          { x: clas.width / 2 + rimPos(y) - 1, y: y },
          { x: clas.width / 2 - rimPos(y) + 1, y: y },
        ])
    }
  },
  end: icon,
  frame: function (config: Config, clas: LayoutedNode) {
    var w = clas.parts[0].width ?? 0
    var h = clas.parts[0].height ?? 0
    clas.parts[0].width = h / 2 + (clas.parts[0].width ?? 0)
    box(config, clas)
    if (clas.dividers?.length) clas.dividers.shift()
    clas.dividers?.unshift([
      { x: 0, y: h },
      { x: w - h / 4, y: h },
      { x: w + h / 4, y: h / 2 },
      { x: w + h / 4, y: 0 },
    ])
  },
  hidden: function (config: Config, clas: LayoutedNode) {
    clas.dividers = []
    clas.parts = []
    clas.width = 1
    clas.height = 1
  },
  input: box,
  lollipop: labelledIcon,
  none: box,
  note: box,
  package: box,
  pipe: function box(config: Config, clas: LayoutedNode) {
    offsetBox(config, clas, { x: -config.padding / 2, y: 0 })
  },
  receiver: box,
  rhomb: function (config: Config, clas: LayoutedNode) {
    var width = Math.max(...clas.parts.map((e) => e.width ?? 0))
    var height = sum(clas.parts, (e) => e.height ?? 0)
    clas.width = width * 1.5
    clas.height = height * 1.5
    clas.dividers = []
    var y = height * 0.25
    for (var comp of clas.parts) {
      comp.x = width * 0.25
      comp.y = y
      comp.width = width
      y += comp.height ?? 0
      var slope = clas.width / clas.height
      if (comp != last(clas.parts))
        clas.dividers.push([
          {
            x: clas.width / 2 + (y < clas.height / 2 ? y * slope : (clas.height - y) * slope),
            y: y,
          },
          {
            x: clas.width / 2 - (y < clas.height / 2 ? y * slope : (clas.height - y) * slope),
            y: y,
          },
        ])
    }
  },
  roundrect: box,
  sender: box,
  socket: labelledIcon,
  start: icon,
  sync: function (config: Config, clas: LayoutedNode) {
    clas.dividers = []
    clas.parts = []
    if (config.direction == 'LR') {
      clas.width = config.lineWidth * 3
      clas.height = config.fontSize * 5
    } else {
      clas.width = config.fontSize * 5
      clas.height = config.lineWidth * 3
    }
  },
  table: function (config: Config, clas: LayoutedNode) {
    if (clas.parts.length == 1) {
      box(config, clas)
      return
    }
    var gridcells = clas.parts.slice(1)
    var rows: LayoutedPart[][] = [[]]
    function isRowBreak(e: LayoutedPart): boolean {
      return !e.lines.length && !e.nodes.length && !e.assocs.length
    }
    function isRowFull(e: LayoutedPart): boolean {
      var current = last(rows)
      return rows[0] != current && rows[0].length == current.length
    }
    function isEnd(e: LayoutedPart): boolean {
      return comp == last(gridcells)
    }
    for (var comp of gridcells) {
      if (!isEnd(comp) && isRowBreak(comp) && last(rows).length) {
        rows.push([])
      } else if (isRowFull(comp)) {
        rows.push([comp])
      } else {
        last(rows).push(comp)
      }
    }
    var header = clas.parts[0]
    var cellW = Math.max(
      (header.width ?? 0) / rows[0].length,
      ...gridcells.map((e) => e.width ?? 0)
    )
    var cellH = Math.max(...gridcells.map((e) => e.height ?? 0))
    clas.width = cellW * rows[0].length
    clas.height = (header.height ?? 0) + cellH * rows.length
    var hh = header.height ?? 0
    clas.dividers = [
      [
        { x: 0, y: header.height ?? 0 },
        { x: 0, y: header.height ?? 0 },
      ],
      ...rows.map((e, i) => [
        { x: 0, y: hh + i * cellH },
        { x: clas.width ?? 0, y: hh + i * cellH },
      ]),
      ...rows[0].map((e, i) => [
        { x: (i + 1) * cellW, y: hh },
        { x: (i + 1) * cellW, y: clas.height },
      ]),
    ]
    header.x = 0
    header.y = 0
    header.width = clas.width
    for (var i = 0; i < rows.length; i++) {
      for (var j = 0; j < rows[i].length; j++) {
        var cell = rows[i][j]
        cell.x = j * cellW
        cell.y = hh + i * cellH
        cell.width = cellW
      }
    }
    clas.parts = clas.parts.filter((e) => !isRowBreak(e))
  },
  transceiver: box,
}

export var visualizers: { [key in Visual]: Visualizer } = {
  actor: function (node, x, y, config, g) {
    var a = config.padding / 2
    var yp = y + a * 4
    var faceCenter = { x: node.x, y: yp - a }
    g.circle(faceCenter, a).fillAndStroke()
    g.path([
      { x: node.x, y: yp },
      { x: node.x, y: yp + 2 * a },
    ]).stroke()
    g.path([
      { x: node.x - a, y: yp + a },
      { x: node.x + a, y: yp + a },
    ]).stroke()
    g.path([
      { x: node.x - a, y: yp + a + config.padding },
      { x: node.x, y: yp + config.padding },
      { x: node.x + a, y: yp + a + config.padding },
    ]).stroke()
  },
  class: function (node, x, y, config, g) {
    g.rect(x, y, node.width, node.height).fillAndStroke()
  },
  database: function (node, x, y, config, g) {
    var pad = config.padding
    var cy = y - pad / 2
    var pi = 3.1416
    g.rect(x, y + pad, node.width, node.height - pad * 2).fill()
    g.path([
      { x: x, y: cy + pad * 1.5 },
      { x: x, y: cy - pad * 0.5 + node.height },
    ]).stroke()
    g.path([
      { x: x + node.width, y: cy + pad * 1.5 },
      { x: x + node.width, y: cy - pad * 0.5 + node.height },
    ]).stroke()
    g.ellipse({ x: node.x, y: cy + pad * 1.5 }, node.width, pad * 1.5).fillAndStroke()
    g.ellipse(
      { x: node.x, y: cy - pad * 0.5 + node.height },
      node.width,
      pad * 1.5,
      0,
      pi
    ).fillAndStroke()
  },
  ellipse: function (node, x, y, config, g) {
    g.ellipse({ x: node.x, y: node.y }, node.width, node.height).fillAndStroke()
  },
  end: function (node, x, y, config, g) {
    g.circle({ x: node.x, y: y + node.height / 2 }, node.height / 3).fillAndStroke()
    g.fillStyle(config.stroke)
    g.circle({ x: node.x, y: y + node.height / 2 }, node.height / 3 - config.padding / 2).fill()
  },
  frame: function (node, x, y, config, g) {
    g.rect(x, y, node.width, node.height).fillAndStroke()
  },
  hidden: function (node, x, y, config, g) {},
  input: function (node, x, y, config, g) {
    g.circuit([
      { x: x + config.padding, y: y },
      { x: x + node.width, y: y },
      { x: x + node.width - config.padding, y: y + node.height },
      { x: x, y: y + node.height },
    ]).fillAndStroke()
  },
  lollipop: function (node, x, y, config, g) {
    g.circle({ x: node.x, y: y + node.height / 2 }, node.height / 2.5).fillAndStroke()
  },
  none: function (node, x, y, config, g) {},
  note: function (node, x, y, config, g) {
    g.circuit([
      { x: x, y: y },
      { x: x + node.width - config.padding, y: y },
      { x: x + node.width, y: y + config.padding },
      { x: x + node.width, y: y + node.height },
      { x: x, y: y + node.height },
      { x: x, y: y },
    ]).fillAndStroke()
    g.path([
      { x: x + node.width - config.padding, y: y },
      { x: x + node.width - config.padding, y: y + config.padding },
      { x: x + node.width, y: y + config.padding },
    ]).stroke()
  },
  package: function (node, x, y, config, g) {
    var headHeight = node.parts[0].height ?? 0
    g.rect(x, y + headHeight, node.width, node.height - headHeight).fillAndStroke()
    var w = g.measureText(node.parts[0].lines[0]).width + 2 * config.padding
    g.circuit([
      { x: x, y: y + headHeight },
      { x: x, y: y },
      { x: x + w, y: y },
      { x: x + w, y: y + headHeight },
    ]).fillAndStroke()
  },
  pipe: function (node, x, y, config, g) {
    var pad = config.padding
    var pi = 3.1416
    g.rect(x, y, node.width, node.height).fill()
    g.path([
      { x: x, y: y },
      { x: x + node.width, y: y },
    ]).stroke()
    g.path([
      { x: x, y: y + node.height },
      { x: x + node.width, y: y + node.height },
    ]).stroke()
    g.ellipse({ x: x + node.width, y: node.y }, pad * 1.5, node.height).fillAndStroke()
    g.ellipse({ x: x, y: node.y }, pad * 1.5, node.height, pi / 2, (pi * 3) / 2).fillAndStroke()
  },
  receiver: function (node, x, y, config, g) {
    g.circuit([
      { x: x - config.padding, y: y },
      { x: x + node.width, y: y },
      { x: x + node.width, y: y + node.height },
      { x: x - config.padding, y: y + node.height },
      { x: x, y: y + node.height / 2 },
    ]).fillAndStroke()
  },
  rhomb: function (node, x, y, config, g) {
    g.circuit([
      { x: node.x, y: y },
      { x: x + node.width, y: node.y },
      { x: node.x, y: y + node.height },
      { x: x, y: node.y },
    ]).fillAndStroke()
  },
  roundrect: function (node, x, y, config, g) {
    var r = Math.min(config.padding * 2 * config.leading, node.height / 2)
    g.roundRect(x, y, node.width, node.height, r).fillAndStroke()
  },
  sender: function (node, x, y, config, g) {
    g.circuit([
      { x: x, y: y },
      { x: x + node.width - config.padding, y: y },
      { x: x + node.width, y: y + node.height / 2 },
      { x: x + node.width - config.padding, y: y + node.height },
      { x: x, y: y + node.height },
    ]).fillAndStroke()
  },
  socket: function (node, x, y, config, g) {
    var from = config.direction === 'TB' ? Math.PI : Math.PI / 2
    var to = config.direction === 'TB' ? 2 * Math.PI : -Math.PI / 2
    g.ellipse({ x: node.x, y: node.y }, node.width, node.height, from, to).stroke()
  },
  start: function (node, x, y, config, g) {
    g.fillStyle(config.stroke)
    g.circle({ x: node.x, y: y + node.height / 2 }, node.height / 2.5).fill()
  },
  sync: function (node, x, y, config, g) {
    g.fillStyle(config.stroke)
    g.rect(x, y, node.width, node.height).fillAndStroke()
  },
  table: function (node, x, y, config, g) {
    g.rect(x, y, node.width, node.height).fillAndStroke()
  },
  transceiver: function (node, x, y, config, g) {
    g.circuit([
      { x: x - config.padding, y: y },
      { x: x + node.width - config.padding, y: y },
      { x: x + node.width, y: y + node.height / 2 },
      { x: x + node.width - config.padding, y: y + node.height },
      { x: x - config.padding, y: y + node.height },
      { x: x, y: y + node.height / 2 },
    ]).fillAndStroke()
  },
}
