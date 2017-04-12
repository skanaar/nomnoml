var nomnoml = nomnoml || {}

nomnoml.styles = {
  ABSTRACT: { center: 1, bold: 0, underline: 0, italic: 1, dashed: 0, empty: 0, hull: 'auto', visual: 'class' },
  ACTOR:    { center: 1, bold: 0, underline: 0, italic: 0, dashed: 0, empty: 0, hull: 'auto', visual: 'actor' },
  CHOICE:   { center: 1, bold: 0, underline: 0, italic: 0, dashed: 0, empty: 0, hull: 'auto', visual: 'rhomb' },
  CLASS:    { center: 1, bold: 1, underline: 0, italic: 0, dashed: 0, empty: 0, hull: 'auto', visual: 'class' },
  DATABASE: { center: 1, bold: 1, underline: 0, italic: 0, dashed: 0, empty: 0, hull: 'auto', visual: 'database' },
  END:      { center: 1, bold: 0, underline: 0, italic: 0, dashed: 0, empty: 1, hull: 'icon', visual: 'end' },
  FRAME:    { center: 0, bold: 0, underline: 0, italic: 0, dashed: 0, empty: 0, hull: 'auto', visual: 'frame' },
  HIDDEN:   { center: 1, bold: 0, underline: 0, italic: 0, dashed: 0, empty: 1, hull: 'empty', visual: 'hidden' },
  INPUT:    { center: 1, bold: 0, underline: 0, italic: 0, dashed: 0, empty: 0, hull: 'auto', visual: 'input' },
  INSTANCE: { center: 1, bold: 0, underline: 1, italic: 0, dashed: 0, empty: 0, hull: 'auto', visual: 'class' },
  LABEL:    { center: 0, bold: 0, underline: 0, italic: 0, dashed: 0, empty: 0, hull: 'auto', visual: 'none' },
  NOTE:     { center: 0, bold: 0, underline: 0, italic: 0, dashed: 0, empty: 0, hull: 'auto', visual: 'note' },
  PACKAGE:  { center: 0, bold: 0, underline: 0, italic: 0, dashed: 0, empty: 0, hull: 'auto', visual: 'package' },
  RECEIVER: { center: 0, bold: 0, underline: 0, italic: 0, dashed: 0, empty: 0, hull: 'auto', visual: 'receiver' },
  REFERENCE:{ center: 1, bold: 0, underline: 0, italic: 0, dashed: 1, empty: 0, hull: 'auto', visual: 'class' },
  SENDER:   { center: 0, bold: 0, underline: 0, italic: 0, dashed: 0, empty: 0, hull: 'auto', visual: 'sender' },
  START:    { center: 1, bold: 0, underline: 0, italic: 0, dashed: 0, empty: 1, hull: 'icon', visual: 'start' },
  STATE:    { center: 1, bold: 0, underline: 0, italic: 0, dashed: 0, empty: 0, hull: 'auto', visual: 'roundrect' },
  USECASE:  { center: 1, bold: 0, underline: 0, italic: 0, dashed: 0, empty: 0, hull: 'auto', visual: 'ellipse' },
}

nomnoml.visualizers = {
  actor : function (node, x, y, padding, config, g) {
    var a = padding/2
    var yp = y + a/2
    var actorCenter = {x: node.x, y: yp-a}
    g.circle(actorCenter, a).fillAndStroke()
    g.path([ {x: node.x,   y: yp}, {x: node.x,   y: yp+2*a} ]).stroke()
    g.path([ {x: node.x-a, y: yp+a}, {x: node.x+a, y: yp+a} ]).stroke()
    g.path([ {x: node.x-a, y: yp+a+padding},
             {x: node.x , y: yp+padding},
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