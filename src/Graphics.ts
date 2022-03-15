export interface Vector {
  x: number
  y: number
}

type LineCap = 'butt' | 'round' | 'square'
type LineJoin = 'bevel' | 'round' | 'miter'

export interface Chainable {
  stroke(): Chainable
  fill(): Chainable
  fillAndStroke(): Chainable
}

export interface Graphics {
  width(): number
  height(): number
  clear(): void
  circle(center: Vector, r: number): Chainable
  ellipse(center: Vector, w: number, h: number, start?: number, stop?: number): Chainable
  arc(x: number, y: number, r: number, start: number, stop: number): Chainable
  roundRect(x: number, y: number, w: number, h: number, r: number): Chainable
  rect(x: number, y: number, w: number, h: number): Chainable
  path(points: Vector[]): Chainable
  circuit(path: Vector[], offset?: Vector, s?: number): Chainable
  setFont(family: string, size: number, weight: 'bold' | 'normal', style: 'italic' | 'normal'): void
  strokeStyle(stroke: string): void
  fillStyle(fill: string): void
  arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): void
  beginPath(): Chainable
  fillText(text: string, x: number, y: number): Chainable
  lineCap(cap: LineCap): void
  lineJoin(join: LineJoin): void
  lineTo(x: number, y: number): Chainable
  lineWidth(w: number): void
  measureText(s: string): { width: number }
  moveTo(x: number, y: number): void
  restore(): void
  save(): void
  setData(name: string, value?: string): void
  scale(x: number, y: number): void
  setLineDash(d: number[]): void
  stroke(): void
  textAlign(a: string): void
  translate(dx: number, dy: number): void
}
