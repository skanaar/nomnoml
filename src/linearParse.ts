import { Association, Ast, Directive, Node, Part } from './parser'

type Attrs = Record<string, string>

function extractDirectives(source: string): Directive[] {
  const directives: Directive[] = []
  for (const line of source.split('\n')) {
    if (line[0] === '#') {
      const [key, ...values] = line.slice(1).split(':')
      directives.push({ key, value: values.join(':').trim() })
    }
  }
  return directives
}

export function linearParse(source: string): Ast {
  let line = 1
  let lineStartIndex = 0
  let index = 0

  const directives = extractDirectives(source)

  source = source.replace(/\/\/[^\n]*/g, '').replace(/^#[^\n]*/g, '')

  if (source.trim() === '')
    return {
      root: { nodes: [], assocs: [], lines: [] },
      directives,
    }

  const part = parsePart()

  return { root: part, directives }

  function advanceLineCounter() {
    line++
    lineStartIndex = index
  }

  function addNode(nodes: Node[], node: Node) {
    const i = nodes.findIndex((e) => e.id === node.id)
    if (i === -1) nodes.push(node)
    else if (nodes[i].parts.length < node.parts.length) nodes[i] = node
  }

  function parsePart(): Part {
    const nodes: Node[] = []
    const assocs: Association[] = []
    const lines: string[] = []

    while (index < source.length) {
      discard(/ /)
      if (source[index] === '\n') {
        pop()
        advanceLineCounter()
        continue
      }
      if (source[index] === ';') {
        pop()
        continue
      }
      if (source[index] == '|' || source[index] == ']') {
        index++
        return { nodes, assocs, lines }
      }
      if (source[index] == '/' && source[index + 1] == '/') {
        parseComment() // discard
      } else if (source[index] == '[') {
        const extracted = parseNodesAndAssocs()
        for (const node of extracted.nodes) addNode(nodes, node)
        for (const assoc of extracted.assocs) assocs.push(assoc)
      } else if (source[index] == '#') {
        parseDirective() // discard
      } else {
        const text = parseLine().trim()
        if (text) lines.push(text)
      }
    }
    return { nodes, assocs, lines }
  }

  function parseNodesAndAssocs(): { nodes: Node[]; assocs: Association[] } {
    const nodes: Node[] = []
    const assocs: Association[] = []
    let node = parseNode()
    addNode(nodes, node)
    while (index < source.length) {
      discard(/ /)
      if (isOneOf('\n', ']', '|', ';')) {
        return { nodes, assocs }
      } else {
        const { association, target } = parseAssociation(node)
        assocs.push(association)
        addNode(nodes, target)
        node = target
      }
    }
    return { nodes, assocs }
  }

  function transformEscapes(char: string): string {
    if (char === 'n') return '\n'
    return char
  }

  function parseAssociation(fromNode: Node): { association: Association; target: Node } {
    let startLabel = ''
    while (index < source.length) {
      if (isOneOf('\\')) {
        pop()
        startLabel += transformEscapes(pop())
      }
      if (isOneOf('(o-', '(-', 'o<-', 'o-', '+-', '<:-', '<-', '-')) break
      else startLabel += pop()
    }
    const assoc1 = consumeOneOf('(o', '(', 'o<', 'o', '+', '<:', '<', '')
    const assoc2 = consumeOneOf('--', '-/-', '-')
    const assoc3 = consumeOneOf('o)', 'o', '>o', '>', ')', '+', ':>', '')
    const endLabel = consumeOptional(/[^\[]/)
    const target = parseNode()
    return {
      association: {
        type: `${assoc1}${assoc2}${assoc3}`,
        start: fromNode.id,
        end: target.id,
        startLabel: { text: startLabel.trim() },
        endLabel: { text: endLabel.trim() },
      },
      target: target,
    }
  }

  function parseComment() {
    discard(/[^\n]/)
    if (source[index] == '\n') {
      index++
      advanceLineCounter()
    }
  }

  function parseDirective() {
    index++
    const key = consume(/[.a-zA-Z0-9_-]/)
    discard(/:/)
    discard(/ /)
    const value = consumeOptional(/[^\n]/)
    return { key, value }
  }

  function parseNode(): Node {
    index++
    let attr: Attrs = {}
    let type = 'class'
    if (source[index] == '<') {
      const meta = parseMeta()
      attr = meta.attr
      type = meta.type ?? 'class'
    }
    const parts = [parsePart()]
    while (source[index - 1] == '|') parts.push(parsePart())
    discard(/ /)
    if (source[index] === '/' && source[index + 1] === '/') parseComment()
    return { parts: parts, attr, id: attr.id ?? parts[0].lines[0], type }
  }

  function parseLine(): string {
    const chars: string[] = []
    while (index < source.length) {
      if (source[index] === '\\') {
        pop()
        chars.push(transformEscapes(pop()))
      } else if (source[index].match(/[\[\]|;\n]/)) {
        break
      } else {
        chars.push(pop())
      }
    }
    return chars.join('')
  }

  function parseMeta(): { type: string; attr: Attrs } {
    index++
    const type = consume(/[a-zA-Z0-9_]/)
    const char = pop()
    if (char == '>') return { type, attr: {} }
    if (char != ' ') error(' >', char)
    return { type, attr: parseAttrs() }
  }

  function parseAttrs(): Attrs {
    const key = consume(/[a-zA-Z0-9_]/)
    const separator = pop()
    if (separator != '=') error('=', separator)
    const value = consume(/[^> ]/)
    const char = pop()
    if (char == '>') return { [key]: value }
    if (char == ' ') return { [key]: value, ...parseAttrs() }
    error(' >', char)
  }

  function pop() {
    const char = source[index]
    index++
    return char
  }

  function discard(regex: RegExp): void {
    while (source[index]?.match(regex)) index++
  }

  function consume(regex: RegExp, optional?: 'optional'): string {
    const start = index
    while (source[index]?.match(regex)) index++
    const end = index
    if (!optional && start == end) error(regex.toString(), source[index])
    return source.slice(start, end)
  }

  function consumeOptional(regex: RegExp): string {
    return consume(regex, 'optional')
  }

  function isOneOf(...patterns: string[]): boolean {
    for (const pattern of patterns) {
      const token = source.slice(index, index + pattern.length)
      if (token == pattern) {
        return true
      }
    }
    return false
  }

  function consumeOneOf(...patterns: string[]): string {
    for (const pattern of patterns) {
      const token = source.slice(index, index + pattern.length)
      if (token == pattern) {
        index += pattern.length
        return pattern
      }
    }
    error(patterns.join(' or '), source[index])
  }

  function error(expected: string, actual: string): never {
    throw new ParseError(expected, actual, line, index - lineStartIndex)
  }
}

class ParseError extends Error {
  expected: string
  actual: string
  line: number
  column: number
  constructor(expected: string, actual: string, line: number, column: number) {
    super(`Parse error at ${line}:${column}, expected ${expected} but got ${actual}`)
    this.expected = expected
    this.actual = actual
    this.line = line
    this.column = column
  }
}
