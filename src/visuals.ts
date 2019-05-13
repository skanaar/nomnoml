/* jshint maxlen:130 */

namespace nomnoml {
  export var styles: { [key: string]: Style } = {
    ABSTRACT:    buildStyle({ visual:'class', center:true, italic:true }),
    ACTOR:       buildStyle({ visual:'actor', center:true }),
    CHOICE:      buildStyle({ visual:'rhomb', center:true }),
    CLASS:       buildStyle({ visual:'class', center:true, bold:true }),
    DATABASE:    buildStyle({ visual:'database', center:true, bold:true }),
    END:         buildStyle({ visual:'end', center:true, empty:true, hull:'icon' }),
    FRAME:       buildStyle({ visual:'frame' }),
    HIDDEN:      buildStyle({ visual:'hidden', center:true, empty:true, hull:'empty' }),
    INPUT:       buildStyle({ visual:'input', center:true }),
    INSTANCE:    buildStyle({ visual:'class', center:true, underline:true }),
    LABEL:       buildStyle({ visual:'none' }),
    NOTE:        buildStyle({ visual:'note' }),
    PACKAGE:     buildStyle({ visual:'package' }),
    RECEIVER:    buildStyle({ visual:'receiver' }),
    REFERENCE:   buildStyle({ visual:'class', center:true, dashed:true }),
    SENDER:      buildStyle({ visual:'sender' }),
    START:       buildStyle({ visual:'start', center:true, empty:true, hull:'icon' }),
    STATE:       buildStyle({ visual:'roundrect', center:true }),
    TRANSCEIVER: buildStyle({ visual:'transceiver' }),
    USECASE:     buildStyle({ visual:'ellipse', center:true }),
  }

  export var visualizers: { [key: string]: Visualizer } = {
    actor : function (node, x, y, config, g) {
      var a = config.padding/2
      var yp = y + a/2
      var actorCenter = {x: node.x, y: yp-a}
      g.circle(actorCenter, a).fillAndStroke()
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
      var cy = y-config.padding/2
      var pi = 3.1416
      g.rect(x, y, node.width, node.height).fill()
      g.path([{x: x, y: cy}, {x: x, y: cy+node.height}]).stroke()
      g.path([
        {x: x+node.width, y: cy},
        {x: x+node.width, y: cy+node.height}]).stroke()
      g.ellipse({x: node.x, y: cy}, node.width, config.padding*1.5).fillAndStroke()
      g.ellipse({x: node.x, y: cy+node.height}, node.width, config.padding*1.5, 0, pi)
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
        {x:node.x, y:y - config.padding},
        {x:x+node.width + config.padding, y:node.y},
        {x:node.x, y:y+node.height + config.padding},
        {x:x - config.padding, y:node.y}
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
    transceiver : function (node, x, y, config, g) {
        g.circuit([
          {x: x-config.padding, y: y},
          {x: x+node.width, y: y},
          {x: x+node.width+config.padding, y: y+node.height/2},
          {x: x+node.width, y: y+node.height},
          {x: x-config.padding, y: y+node.height},
          {x: x, y: y+node.height/2}
        ]).fillAndStroke()
    },
  }
}
