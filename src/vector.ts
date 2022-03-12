export interface Vec {
  x: number
  y: number
}

export function dist(a: Vec, b: Vec): number {
  return mag(diff(a, b))
}
export function add(a: Vec, b: Vec): Vec {
  return { x: a.x + b.x, y: a.y + b.y }
}
export function diff(a: Vec, b: Vec): Vec {
  return { x: a.x - b.x, y: a.y - b.y }
}
export function mult(v: Vec, factor: number): Vec {
  return { x: factor * v.x, y: factor * v.y }
}
export function mag(v: Vec): number {
  return Math.sqrt(v.x * v.x + v.y * v.y)
}
export function normalize(v: Vec): Vec {
  return mult(v, 1 / mag(v))
}
export function rot(a: Vec): Vec {
  return { x: a.y, y: -a.x }
}
