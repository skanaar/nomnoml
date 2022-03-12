import { Config, Relation } from './domain'
import { Graphics } from './Graphics'
import { last, range } from './util'
import { Vec, diff, normalize, add, mult, rot } from './vector'

const empty = false
const filled = true

export function getPath(config: Config, r: Relation): Vec[] {
  var path = r.path!.slice(1, -1)
  var endDir = normalize(diff(path[path.length - 2], last(path)))
  var startDir = normalize(diff(path[1], path[0]))
  var size = (config.spacing * config.arrowSize) / 30
  var A = 0
  var Ω = path.length - 1
  var copy = path.map((p) => ({ x: p.x, y: p.y }))
  var tokens = r.assoc.split(/[-_]/)
  copy[A] = add(copy[A], mult(startDir, size * terminatorSize(tokens[0])))
  copy[Ω] = add(copy[Ω], mult(endDir, size * terminatorSize(last(tokens))))
  return copy
}

function terminatorSize(id: string): number {
  if (id === '>' || id === '<') return 5
  if (id === ':>' || id === '<:') return 10
  if (id === '+') return 14
  if (id === 'o') return 14
  if (id === '(' || id === ')') return 11
  if (id === '(o' || id === 'o)') return 11
  if (id === '>o' || id === 'o<') return 15
  return 0
}

export function drawTerminators(g: Graphics, config: Config, r: Relation) {
  var start = r.path![1]
  var end = r.path![r.path!.length - 2]
  var path = r.path!.slice(1, -1)

  var tokens = r.assoc.split(/[-_]/)
  drawArrowEnd(last(tokens), path, end)
  drawArrowEnd(tokens[0], path.reverse(), start)

  function drawArrowEnd(id: string, path: Vec[], end: Vec) {
    var dir = normalize(diff(path[path.length - 2], last(path)))
    var size = (config.spacing * config.arrowSize) / 30
    if (id === '>' || id === '<') drawArrow(dir, size, filled, end)
    else if (id === ':>' || id === '<:') drawArrow(dir, size, empty, end)
    else if (id === '+') drawDiamond(dir, size, filled, end)
    else if (id === 'o') drawDiamond(dir, size, empty, end)
    else if (id === '(' || id === ')') {
      drawSocket(dir, size, 11, end)
      drawStem(dir, size, 5, end)
    } else if (id === '(o' || id === 'o)') {
      drawSocket(dir, size, 11, end)
      drawStem(dir, size, 5, end)
      drawBall(dir, size, 11, end)
    } else if (id === '>o' || id === 'o<') {
      drawArrow(dir, size * 0.75, empty, add(end, mult(dir, size * 10)))
      drawStem(dir, size, 8, end)
      drawBall(dir, size, 8, end)
    }
  }

  function drawBall(nv: Vec, size: number, stem: number, end: Vec) {
    var center = add(end, mult(nv, size * stem))
    g.fillStyle(config.fill[0])
    g.ellipse(center, size * 6, size * 6).fillAndStroke()
  }

  function drawStem(nv: Vec, size: number, stem: number, end: Vec) {
    var center = add(end, mult(nv, size * stem))
    g.path([center, end]).stroke()
  }

  function drawSocket(nv: Vec, size: number, stem: number, end: Vec) {
    var base = add(end, mult(nv, size * stem))
    var t = rot(nv)
    var socket = range([-Math.PI / 2, Math.PI / 2], 12).map((a) =>
      add(base, add(mult(nv, -6 * size * Math.cos(a)), mult(t, 6 * size * Math.sin(a))))
    )
    g.path(socket).stroke()
  }

  function drawArrow(nv: Vec, size: number, isOpen: boolean, end: Vec) {
    const x = (s: number) => add(end, mult(nv, s * size))
    const y = (s: number) => mult(rot(nv), s * size)
    var arrow = [add(x(10), y(4)), x(isOpen && !config.fillArrows ? 5 : 10), add(x(10), y(-4)), end]
    g.fillStyle(isOpen ? config.stroke : config.fill[0])
    g.circuit(arrow).fillAndStroke()
  }

  function drawDiamond(nv: Vec, size: number, isOpen: boolean, end: Vec) {
    const x = (s: number) => add(end, mult(nv, s * size))
    const y = (s: number) => mult(rot(nv), s * size)
    var arrow = [add(x(7), y(4)), x(14), add(x(7), y(-4)), end]
    g.fillStyle(isOpen ? config.stroke : config.fill[0])
    g.circuit(arrow).fillAndStroke()
  }
}
