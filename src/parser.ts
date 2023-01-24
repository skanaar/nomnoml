import { Ranker } from 'graphre/decl/types'
import { Config, Style, Visual } from './domain'
import { hasSubstring, last } from './util'
import { styles } from './visuals'
// @ts-ignore
import coreParser from '../dist/core-parser'

export interface ParsedDiagram {
  root: Part
  config: Config
}
export interface Part {
  nodes: Node[]
  assocs: Association[]
  lines: string[]
  directives: Directive[]
}
export interface Directive {
  key: string
  value: string
}
export interface Node {
  id: string
  type: string
  attr: Record<string, string>
  parts: Part[]
}
export interface Association {
  id: string
  type: string
  start: string
  end: string
  startLabel: { text: string }
  endLabel: { text: string }
}

export function parse(source: string): ParsedDiagram {
  const withoutComments = source.replace(/\/\/[^\n]*/g, '')
  const graph = coreParser.parse(withoutComments)
  return { root: graph, config: getConfig(graph.directives) }

  function directionToDagre(word: string): 'TB' | 'LR' {
    if (word == 'down') return 'TB'
    if (word == 'right') return 'LR'
    else return 'TB'
  }

  function parseRanker(word: string | undefined): Ranker {
    if (word == 'network-simplex' || word == 'tight-tree' || word == 'longest-path') {
      return word
    }
    return 'network-simplex'
  }

  function parseCustomStyle(styleDef: string): Style {
    var contains = hasSubstring
    var floatingKeywords = styleDef.replace(/[a-z]*=[^ ]+/g, '')
    var titleDef = last(styleDef.match('title=([^ ]*)') || [''])
    var bodyDef = last(styleDef.match('body=([^ ]*)') || [''])
    return {
      title: {
        bold: contains(titleDef, 'bold') || contains(floatingKeywords, 'bold'),
        underline: contains(titleDef, 'underline') || contains(floatingKeywords, 'underline'),
        italic: contains(titleDef, 'italic') || contains(floatingKeywords, 'italic'),
        center: !(contains(titleDef, 'left') || contains(styleDef, 'align=left')),
      },
      body: {
        bold: contains(bodyDef, 'bold'),
        underline: contains(bodyDef, 'underline'),
        italic: contains(bodyDef, 'italic'),
        center: contains(bodyDef, 'center'),
      },
      dashed: contains(styleDef, 'dashed'),
      fill: last(styleDef.match('fill=([^ ]*)') || []),
      stroke: last(styleDef.match('stroke=([^ ]*)') || []),
      visual: (last(styleDef.match('visual=([^ ]*)') || []) || 'class') as Visual,
      direction: directionToDagre(last(styleDef.match('direction=([^ ]*)') || [])),
    }
  }

  function getConfig(directives: Directive[]): Config {
    var d = Object.fromEntries(directives.map((e) => [e.key, e.value]))
    var userStyles: { [index: string]: Style } = {}
    for (var key in d) {
      if (key[0] != '.') continue
      var styleDef = d[key]
      userStyles[key.substring(1)] = parseCustomStyle(styleDef)
    }
    return {
      arrowSize: +d.arrowSize || 1,
      bendSize: +d.bendSize || 0.3,
      direction: directionToDagre(d.direction),
      gutter: +d.gutter || 20,
      edgeMargin: +d.edgeMargin || 0,
      gravity: +(d.gravity ?? 1),
      edges: d.edges == 'hard' ? 'hard' : 'rounded',
      fill: (d.fill || '#eee8d5;#fdf6e3;#eee8d5;#fdf6e3').split(';'),
      background: d.background || 'transparent',
      fillArrows: d.fillArrows === 'true',
      font: d.font || 'Helvetica',
      fontSize: +d.fontSize || 12,
      leading: +d.leading || 1.25,
      lineWidth: +d.lineWidth || 3,
      padding: +d.padding || 8,
      spacing: +d.spacing || 40,
      stroke: d.stroke || '#33322E',
      title: d.title || '',
      zoom: +d.zoom || 1,
      acyclicer: d.acyclicer === 'greedy' ? 'greedy' : undefined,
      ranker: parseRanker(d.ranker),
      styles: { ...styles, ...userStyles },
    }
  }
}
