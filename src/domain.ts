import { Ranker } from "graphre/decl/types"
import { Graphics } from "./Graphics"

export interface Config {
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
  ranker: Ranker
}

export interface Measurer {
    setFont(config: Config, isBold: 'bold'|'normal', isItalic:'italic'|'normal'): void
    textWidth(text: string): number
    textHeight(): number
}

export interface Visualizer {
  (node: Classifier, x: number, y: number, config: Config, g: Graphics): void
}

export interface NodeLayouter {
  (config: Config, node: Classifier): void
}

export type Visual = 
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
  'sync'|
  'table'|
  'transceiver'
  
export interface TextStyle {
  bold: boolean
  underline: boolean
  italic: boolean
  center: boolean
}

export interface Style {
  title: TextStyle
  body: TextStyle
  dashed: boolean
  empty: boolean
  fill: string|undefined
  stroke: string|undefined
  visual: Visual
  direction: 'TB'|'LR'|undefined
}

export class Compartment {
  x: number
  y: number
  width: number
  height: number
  offset: { x: number, y: number }
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
  path?: { x: number, y: number }[]
  start: string
  end: string
  startLabel: RelationLabel
  endLabel: RelationLabel
  assoc: string
}

export class Classifier {
  x: number
  y: number
  width: number
  height: number
  layoutWidth: number
  layoutHeight: number
  dividers: { x: number, y: number }[][]
  constructor(
    public type: string,
    public name: string,
    public compartments: Compartment[]
  ){
    this.dividers = []
  }
}
