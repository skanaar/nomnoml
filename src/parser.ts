import { Ranker } from 'graphre/decl/types'
import { Config, Style, Visual } from './domain'
import { linearParse } from './linearParse'
import { hasSubstring, last } from './util'
import { styles } from './visuals'

export { ParseError } from './linearParse'

export interface ParsedDiagram {
  root: Part
  directives: Directive[]
  config: Config
}
export interface Ast {
  root: Part
  directives: Directive[]
}
export interface Part {
  nodes: Node[]
  assocs: Association[]
  lines: string[]
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
  id?: string
  type: string
  start: string
  end: string
  startLabel: { text: string }
  endLabel: { text: string }
}

export function parse(source: string): ParsedDiagram {
  const { root, directives } = linearParse(source)

  return { root, directives, config: getConfig(directives) }

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
    const contains = hasSubstring
    const floatingKeywords = styleDef.replace(/[a-z]*=[^ ]+/g, '')
    const titleDef = last(styleDef.match('title=([^ ]*)') || [''])
    const bodyDef = last(styleDef.match('body=([^ ]*)') || [''])
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
    const d = Object.fromEntries(directives.map((e) => [e.key, e.value]))
    const userStyles: { [index: string]: Style } = {}
    for (const key in d) {
      if (key[0] != '.') continue
      const styleDef = d[key]
      userStyles[key.substring(1)] = parseCustomStyle(styleDef)
    }
    return {
      arrowSize: +d.arrowSize || 1,
      bendSize: +d.bendSize || 0.3,
      direction: directionToDagre(d.direction),
      gutter: +d.gutter || 20,
      edgeMargin: +d.edgeMargin || 0,
      gravity: Math.round(+(d.gravity ?? 1)),
      edges: d.edges == 'hard' ? 'hard' : 'rounded',
      fill: (d.fill || '#eee8d5;#fdf6e3;#eee8d5;#fdf6e3').split(';'),
      background: d.background || 'transparent',
      fillArrows: d.fillArrows === 'true',
      font: d.font || 'Helvetica',
      fontSize: +d.fontSize || 12,
      leading: +d.leading || 1.35,
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
