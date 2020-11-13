import { Classifier, Compartment, Config, NodeLayouter, Style, TextStyle, Visual, Visualizer } from "./domain"
import { sum, last, range } from "./util"

export function buildStyle(conf: Partial<Style>, title: Partial<TextStyle>, body: Partial<TextStyle> = {}): Style {
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
    empty: conf.empty || false,
    fill: conf.fill || undefined,
    stroke: conf.stroke || undefined,
    visual: conf.visual || 'class',
    direction: conf.direction || undefined,
  }
}

export var styles: { [key: string]: Style } = {
  ABSTRACT:    buildStyle({ visual:'class' }, { center:true, italic:true }),
  ACTOR:       buildStyle({ visual:'actor' }, { center:true }, { center: true }),
  CHOICE:      buildStyle({ visual:'rhomb' }, { center:true }, { center: true }),
  CLASS:       buildStyle({ visual:'class' }, { center:true, bold:true }),
  DATABASE:    buildStyle({ visual:'database' }, { center:true, bold:true }, { center: true }),
  END:         buildStyle({ visual:'end', empty:true }, {}),
  FRAME:       buildStyle({ visual:'frame' }, {}),
  HIDDEN:      buildStyle({ visual:'hidden', empty:true }, {}),
  INPUT:       buildStyle({ visual:'input' }, { center:true }),
  INSTANCE:    buildStyle({ visual:'class' }, { center:true, underline:true }),
  LABEL:       buildStyle({ visual:'none' }, { center:true }),
  NOTE:        buildStyle({ visual:'note' }, {}),
  PACKAGE:     buildStyle({ visual:'package' }, {}),
  RECEIVER:    buildStyle({ visual:'receiver' }, {}),
  REFERENCE:   buildStyle({ visual:'class', dashed:true }, { center:true }),
  SENDER:      buildStyle({ visual:'sender' }, {}),
  START:       buildStyle({ visual:'start', empty:true }, {}),
  STATE:       buildStyle({ visual:'roundrect' }, { center:true }),
  TABLE:       buildStyle({ visual:'table' }, { center:true, bold:true }),
  TRANSCEIVER: buildStyle({ visual:'transceiver' }, {}),
  USECASE:     buildStyle({ visual:'ellipse' }, { center:true }, { center: true }),
}

function box(config: Config, clas: Classifier) {
  clas.width = Math.max(...clas.compartments.map(e => e.width))
  clas.height = sum(clas.compartments, e => e.height)
  clas.dividers = []
  var y = 0
  for(var comp of clas.compartments) {
    comp.x = 0
    comp.y = y
    comp.width = clas.width
    y += comp.height
    if (comp != last(clas.compartments))
      clas.dividers.push([{ x: 0, y: y }, { x: clas.width, y: y }])
  }
}

function icon(config: Config, clas: Classifier) {
  clas.dividers = []
  clas.compartments = []
  clas.width = config.fontSize * 2.5
  clas.height = config.fontSize * 2.5
}

export var layouters: { [key in Visual]: NodeLayouter } = {
  actor: function (config: Config, clas: Classifier) {
    clas.width = Math.max(config.padding * 2, ...clas.compartments.map(e => e.width))
    clas.height = config.padding * 3 + sum(clas.compartments, e => e.height)
    clas.dividers = []
    var y = config.padding*3
    for(var comp of clas.compartments) {
      comp.x = 0
      comp.y = y
      comp.width = clas.width
      y += comp.height
      if (comp != last(clas.compartments))
        clas.dividers.push([{ x: config.padding, y: y }, { x: clas.width-config.padding, y: y }])
    }
  },
  class: box,
  database: function (config: Config, clas: Classifier) {
    clas.width = Math.max(...clas.compartments.map(e => e.width))
    clas.height = sum(clas.compartments, e => e.height) + config.padding*2
    clas.dividers = []
    var y = config.padding*1.5
    for(var comp of clas.compartments) {
      comp.x = 0
      comp.y = y
      comp.width = clas.width
      y += comp.height
      if (comp != last(clas.compartments)){
        var path = range([0, Math.PI], 16).map(a => ({
          x: clas.width * 0.5 * (1 - Math.cos(a)),
          y: y + config.padding * (0.75 * Math.sin(a) - 0.5),
        }))
        clas.dividers.push(path)
      }
    }
  },
  ellipse: function (config: Config, clas: Classifier) {
    var width = Math.max(...clas.compartments.map(e => e.width))
    var height = sum(clas.compartments, e => e.height)
    clas.width = width * 1.25
    clas.height = height * 1.25
    clas.dividers = []
    var y = height*0.125
    var sq = (x: number) => x*x
    var rimPos = (y: number) => Math.sqrt(sq(0.5) - sq(y/clas.height-0.5)) * clas.width
    for(var comp of clas.compartments) {
      comp.x = width*0.125
      comp.y = y
      comp.width = width
      y += comp.height
      if (comp != last(clas.compartments))
        clas.dividers.push([
          { x: clas.width/2 + rimPos(y) - 1, y: y },
          { x: clas.width/2 - rimPos(y) + 1, y: y }
        ])
    }
  },
  end: icon,
  frame: function (config: Config, clas: Classifier) {
    var w = clas.compartments[0].width
    var h = clas.compartments[0].height
    clas.compartments[0].width += h/2
    box(config, clas)
    if (clas.dividers.length) clas.dividers.shift()
    clas.dividers.unshift([
      {x:0, y:h},
      {x:w-h/4, y:h},
      {x:w+h/4, y:h/2},
      {x:w+h/4, y:0}
    ])
  },
  hidden: function (config: Config, clas: Classifier) {
    clas.dividers = []
    clas.compartments = []
    clas.width = 1
    clas.height = 1
  },
  input: box,
  none: box,
  note: box,
  package: box,
  receiver: box,
  rhomb: function (config: Config, clas: Classifier) {
    var width = Math.max(...clas.compartments.map(e => e.width))
    var height = sum(clas.compartments, e => e.height)
    clas.width = width * 1.5
    clas.height = height * 1.5
    clas.dividers = []
    var y = height*0.25
    for(var comp of clas.compartments) {
      comp.x = width*0.25
      comp.y = y
      comp.width = width
      y += comp.height
      var slope = clas.width / clas.height
      if (comp != last(clas.compartments))
        clas.dividers.push([
          { x: clas.width/2 + (y<clas.height/2 ? y*slope : (clas.height-y)*slope), y: y },
          { x: clas.width/2 - (y<clas.height/2 ? y*slope : (clas.height-y)*slope), y: y }
        ])
    }
  },
  roundrect: box,
  sender: box,
  start: icon,
  table: function (config: Config, clas: Classifier) {
    if (clas.compartments.length == 1) {
      box(config, clas)
      return
    }
    var gridcells = clas.compartments.slice(1)
    var rows: Compartment[][] = [[]]
    function isRowBreak(e: Compartment): boolean {
      return !e.lines.length && !e.nodes.length && !e.relations.length
    }
    function isRowFull(e: Compartment): boolean {
      var current = last(rows)
      return rows[0] != current && rows[0].length == current.length
    }
    function isEnd(e: Compartment): boolean {
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
    var header = clas.compartments[0]
    var cellW = Math.max(header.width/rows[0].length, ...gridcells.map(e => e.width))
    var cellH = Math.max(...gridcells.map(e => e.height))
    clas.width = cellW * rows[0].length
    clas.height = header.height + cellH * rows.length  
    var hh = header.height
    clas.dividers = [
      [{ x: 0, y: header.height }, { x: 0, y: header.height }],
      ...rows.map((e,i) => [{ x: 0, y: hh+i*cellH }, { x: clas.width, y: hh+i*cellH }]),
      ...rows[0].map((e,i) => [{ x: (i+1)*cellW, y: hh }, { x: (i+1)*cellW, y: clas.height }]),
    ]
    header.x = 0
    header.y = 0
    header.width = clas.width
    for(var i=0; i<rows.length; i++) {
      for(var j=0; j<rows[i].length; j++) {
        var cell = rows[i][j]
        cell.x = j * cellW
        cell.y = hh + i * cellH
        cell.width = cellW
      }
    }
  },
  transceiver: box,
}

export var visualizers: { [key in Visual]: Visualizer } = {
  actor : function (node, x, y, config, g) {
    var a = config.padding/2
    var yp = y + a*4
    var faceCenter = {x: node.x, y: yp-a}
    g.circle(faceCenter, a).fillAndStroke()
    g.path([ {x: node.x,   y: yp}, {x: node.x,   y: yp+2*a} ]).stroke()
    g.path([ {x: node.x-a, y: yp+a}, {x: node.x+a, y: yp+a} ]).stroke()
    g.path([ {x: node.x-a, y: yp+a+config.padding},
              {x: node.x , y: yp+config.padding},
              {x: node.x+a, y: yp+a+config.padding} ]).stroke()
  },
  class : function (node, x, y, config, g) {
    g.rect(x, y, node.width, node.height).fillAndStroke()
  },
  database : function (node, x, y, config, g) {
    var pad = config.padding
    var cy = y-pad/2
    var pi = 3.1416
    g.rect(x, y+pad, node.width, node.height-pad*1.5).fill()
    g.path([{x: x, y: cy+pad*1.5}, {x: x, y: cy-pad*0.5+node.height}]).stroke()
    g.path([
      {x: x+node.width, y: cy+pad*1.5},
      {x: x+node.width, y: cy-pad*0.5+node.height}]).stroke()
    g.ellipse({x: node.x, y: cy+pad*1.5}, node.width, pad*1.5).fillAndStroke()
    g.ellipse({x: node.x, y: cy-pad*0.5+node.height}, node.width, pad*1.5, 0, pi)
    .fillAndStroke()
  },
  ellipse : function (node, x, y, config, g) {
    g.ellipse({x: node.x, y: node.y}, node.width, node.height).fillAndStroke()
  },
  end : function (node, x, y, config, g) {
    g.circle({ x:node.x, y:y+node.height/2 }, node.height/3).fillAndStroke()
    g.fillStyle(config.stroke)
    g.circle({ x:node.x, y:y+node.height/2 }, node.height/3-config.padding/2).fill()
  },
  frame : function (node, x, y, config, g) {
    g.rect(x, y, node.width, node.height).fillAndStroke()
  },
  hidden : function (node, x, y, config, g) {
  },
  input : function (node, x, y, config, g) {
    g.circuit([
      {x:x+config.padding, y:y},
      {x:x+node.width, y:y},
      {x:x+node.width-config.padding, y:y+node.height},
      {x:x, y:y+node.height}
    ]).fillAndStroke()
  },
  none : function (node, x, y, config, g) {
  },
  note : function (node, x, y, config, g) {
    g.circuit([
      {x: x, y: y},
      {x: x+node.width-config.padding, y: y},
      {x: x+node.width, y: y+config.padding},
      {x: x+node.width, y: y+node.height},
      {x: x, y: y+node.height},
      {x: x, y: y}
    ]).fillAndStroke()
    g.path([
      {x: x+node.width-config.padding, y: y},
      {x: x+node.width-config.padding, y: y+config.padding},
      {x: x+node.width, y: y+config.padding}
    ]).stroke()
  },
  package : function (node, x, y, config, g) {
    var headHeight = node.compartments[0].height
    g.rect(x, y+headHeight, node.width, node.height-headHeight).fillAndStroke()
    var w = g.measureText(node.name).width + 2*config.padding
    g.circuit([
      {x:x, y:y+headHeight},
      {x:x, y:y},
      {x:x+w, y:y},
      {x:x+w, y:y+headHeight}
    ]).fillAndStroke()
  },
  receiver : function (node, x, y, config, g) {
      g.circuit([
        {x: x-config.padding, y: y},
        {x: x+node.width, y: y},
        {x: x+node.width, y: y+node.height},
        {x: x-config.padding, y: y+node.height},
        {x: x, y: y+node.height/2},
      ]).fillAndStroke()
  },
  rhomb : function (node, x, y, config, g) {
    g.circuit([
      {x:node.x, y:y},
      {x:x+node.width, y:node.y},
      {x:node.x, y:y+node.height},
      {x:x, y:node.y}
    ]).fillAndStroke()
  },
  roundrect : function (node, x, y, config, g) {
    var r = Math.min(config.padding*2*config.leading, node.height/2)
    g.roundRect(x, y, node.width, node.height, r).fillAndStroke()
  },
  sender : function (node, x, y, config, g) {
      g.circuit([
        {x: x, y: y},
        {x: x+node.width-config.padding, y: y},
        {x: x+node.width, y: y+node.height/2},
        {x: x+node.width-config.padding, y: y+node.height},
        {x: x, y: y+node.height}
      ]).fillAndStroke()
  },
  start : function (node, x, y, config, g) {
    g.fillStyle(config.stroke)
    g.circle({ x:node.x, y:y+node.height/2 }, node.height/2.5).fill()
  },
  table : function (node, x, y, config, g) {
    g.rect(x, y, node.width, node.height).fillAndStroke()
  },
  transceiver : function (node, x, y, config, g) {
      g.circuit([
        {x: x-config.padding, y: y},
        {x: x+node.width-config.padding, y: y},
        {x: x+node.width, y: y+node.height/2},
        {x: x+node.width-config.padding, y: y+node.height},
        {x: x-config.padding, y: y+node.height},
        {x: x, y: y+node.height/2}
      ]).fillAndStroke()
  },
}
