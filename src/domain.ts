interface Config {
  padding: number
  stroke: string
  font: string
  title: string
  leading: number
  fontSize: number
  lineWidth: number
  gutter: number
  styles: { [key: string]: Style }
  fill: string[]
  background: string
  edges: string
  edgeMargin: number
  gravity: number
  spacing: number
  direction: 'TB'|'LR'
  fillArrows: boolean
  arrowSize: number
  bendSize: number
  zoom: number
  acyclicer: 'greedy' | undefined
  ranker: graphre.Ranker
}

interface Measurer {
    setFont(config: Config, isBold: 'bold'|'normal', isItalic:'italic'|'normal'): void
    textWidth(text: string): number
    textHeight(): number
}

interface Visualizer {
  (node: nomnoml.Classifier, x: number, y: number, config: Config, g: Graphics): void
}

interface NodeLayouter {
  (config: Config, node: nomnoml.Classifier): void
}

type Visual = 
  'actor'|
  'class'|
  'database'|
  'ellipse'|
  'end'|
  'frame'|
  'hidden'|
  'input'|
  'none'|
  'note'|
  'package'|
  'receiver'|
  'rhomb'|
  'roundrect'|
  'sender'|
  'start'|
  'table'|
  'transceiver'

interface Style {
  bold: boolean
  underline: boolean
  italic: boolean
  dashed: boolean
  empty: boolean
  center: boolean
  fill: string|undefined
  stroke: string|undefined
  visual: Visual
  direction: 'TB'|'LR'|undefined
}
namespace nomnoml {

  export function buildStyle(conf: Partial<Style>): Style {
    return {
      bold: conf.bold || false,
      underline: conf.underline || false,
      italic: conf.italic || false,
      dashed: conf.dashed || false,
      empty: conf.empty || false,
      center: conf.center || false,
      fill: conf.fill || undefined,
      stroke: conf.stroke || undefined,
      visual: conf.visual || 'class',
      direction: conf.direction || undefined,
    }
  }

  export class Compartment {
    x: number
    y: number
    width: number
    height: number
    offset: Vector
    constructor(
      public lines: string[], 
      public nodes: Classifier[], 
      public relations: Relation[]
    ){}
  }
  
  export interface RelationLabel {
    x?: number
    y?: number
    width?: number
    height?: number
    text: string
  }

  export class Relation {
    id: number
    path?: Vector[]
    start: string
    end: string
    startLabel: RelationLabel
    endLabel: RelationLabel
    assoc: string
  }

  export class Classifier implements Vec {
    x: number
    y: number
    width: number
    height: number
    layoutWidth: number
    layoutHeight: number
    dividers: Vector[][]
    constructor(
      public type: string,
      public name: string,
      public compartments: Compartment[]
    ){
      this.dividers = []
    }
  }
}
