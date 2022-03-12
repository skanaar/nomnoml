import { Ranker } from 'graphre/decl/types'
import { Classifier, Compartment, Config, Relation, Style, Visual } from './domain'
import { hasSubstring, last, merged, uniqueBy } from './util'
import { styles } from './visuals'
// @ts-ignore
import nomnomlCoreParser from '../dist/nomnoml-core-parser'

interface ParsedDiagram {
  root: Compartment
  config: Config
}
export type AstRoot = AstCompartment
type AstCompartment = AstSlot[]
type AstSlot = string | AstClassifier | AstRelation
interface AstRelation {
  assoc: string
  start: AstClassifier
  end: AstClassifier
  startLabel: string
  endLabel: string
}
interface AstClassifier {
  type: string
  id: string
  parts: AstCompartment[]
}

class Line {
  index: number
  text: string
}

export function parse(source: string): ParsedDiagram {
  function onlyCompilables(line: string) {
    var ok = line[0] !== '#' && line.trim().substring(0, 2) !== '//'
    return ok ? line.trim() : ''
  }
  function isDirective(line: Line): boolean {
    return line.text[0] === '#'
  }
  var lines: Line[] = source.split('\n').map(function (s, i) {
    return { text: s, index: i }
  })
  var pureDirectives = lines.filter(isDirective)
  var directives: { [key: string]: string } = {}
  pureDirectives.forEach(function (line) {
    try {
      var tokens = line.text.substring(1).split(':')
      directives[tokens[0].trim()] = tokens[1].trim()
    } catch (e) {
      throw new Error('line ' + (line.index + 1) + ': Malformed directive')
    }
  })
  var pureDiagramCode = lines.map((e) => onlyCompilables(e.text)).join('\n')

  if (pureDiagramCode == '') {
    return {
      root: new Compartment([], [], []),
      config: getConfig(directives),
    }
  }

  var parseTree = intermediateParse(pureDiagramCode)
  return {
    root: transformParseIntoSyntaxTree(parseTree),
    config: getConfig(directives),
  }

  function directionToDagre(word: any): 'TB' | 'LR' {
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

  function getConfig(d: { [index: string]: string }): Config {
    var userStyles: { [index: string]: Style } = {}
    for (var key in d) {
      if (key[0] != '.') continue
      var styleDef = d[key]
      userStyles[key.substring(1).toUpperCase()] = parseCustomStyle(styleDef)
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
      styles: merged(styles, userStyles),
    }
  }
}

export function intermediateParse(source: string): AstRoot {
  return nomnomlCoreParser.parse(source)
}

export function transformParseIntoSyntaxTree(entity: AstRoot): Compartment {
  function isAstClassifier(obj: AstSlot): obj is AstClassifier {
    return (<AstClassifier>obj).parts !== undefined
  }

  function isAstRelation(obj: AstSlot): obj is AstRelation {
    return (<AstRelation>obj).assoc !== undefined
  }

  var relationId: number = 0

  function transformCompartment(slots: AstCompartment): Compartment {
    var lines: string[] = []
    var rawClassifiers: AstClassifier[] = []
    var relations: Relation[] = []
    slots.forEach(function (p: AstSlot) {
      if (typeof p === 'string') lines.push(p)
      if (isAstRelation(p)) {
        // is a relation
        rawClassifiers.push(p.start)
        rawClassifiers.push(p.end)
        relations.push({
          id: relationId++,
          assoc: p.assoc,
          start: p.start.parts[0][0] as string,
          end: p.end.parts[0][0] as string,
          startLabel: { text: p.startLabel },
          endLabel: { text: p.endLabel },
        })
      }
      if (isAstClassifier(p)) {
        rawClassifiers.push(p)
      }
    })
    var allClassifiers: Classifier[] = rawClassifiers
      .map(transformClassifier)
      .sort(function (a: Classifier, b: Classifier): number {
        return b.compartments.length - a.compartments.length
      })
    var uniqClassifiers = uniqueBy(allClassifiers, 'name')
    var uniqRelations = relations.filter(function (a) {
      for (var b of relations) {
        if (a === b) return true
        if (b.start == a.start && b.end == a.end) return false
      }
      return true
    })
    return new Compartment(lines, uniqClassifiers, uniqRelations)
  }

  function transformClassifier(entity: AstClassifier): Classifier {
    var compartments = entity.parts.map(transformCompartment)
    return new Classifier(entity.type, entity.id, compartments)
  }

  return transformCompartment(entity)
}
