import { Ranker } from 'graphre/decl/types'
import { Graphics } from './Graphics'
import { LayoutedNode } from './layouter'

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
  direction: 'TB' | 'LR'
  fillArrows: boolean
  arrowSize: number
  bendSize: number
  zoom: number
  acyclicer: 'greedy' | undefined
  ranker: Ranker
}

export interface Measurer {
  setFont(family: string, size: number, weight: 'bold' | 'normal', style: 'italic' | 'normal'): void
  textWidth(text: string): number
  textHeight(): number
}

export interface Visualizer {
  (node: LayoutedNode, x: number, y: number, config: Config, g: Graphics): void
}

export interface NodeLayouter {
  (config: Config, node: LayoutedNode): void
}

export type Visual =
  | 'actor'
  | 'class'
  | 'database'
  | 'ellipse'
  | 'end'
  | 'frame'
  | 'hidden'
  | 'input'
  | 'lollipop'
  | 'none'
  | 'note'
  | 'package'
  | 'receiver'
  | 'rhomb'
  | 'roundrect'
  | 'sender'
  | 'socket'
  | 'start'
  | 'sync'
  | 'table'
  | 'transceiver'

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
  fill: string | undefined
  stroke: string | undefined
  visual: Visual
  direction: 'TB' | 'LR' | undefined
}

export interface RelationLabel {
  x?: number
  y?: number
  width?: number
  height?: number
  text: string
}
