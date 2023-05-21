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

  source = source.replace(/^[ \t]*\/\/[^\n]*/gm, '').replace(/^#[^\n]*/gm, '')

  if (source.trim() === '')
    return {
      root: { nodes: [], assocs: [], lines: [] },
      directives,
    }

  const part = parsePart()
  if (index < source.length) error('end of file', source[index])

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
      let lastIndex = index
      discard(/ /)
      if (source[index] === '\n') {
        pop()
        advanceLineCounter()
      } else if (source[index] === ';') {
        pop()
      } else if (source[index] == '|' || source[index] == ']') {
        return { nodes, assocs, lines }
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
      if (index === lastIndex) throw new Error('Infinite loop')
    }
    return { nodes, assocs, lines }
  }

  function parseNodesAndAssocs(): { nodes: Node[]; assocs: Association[] } {
    const nodes: Node[] = []
    const assocs: Association[] = []
    let node = parseNode()
    addNode(nodes, node)
    while (index < source.length) {
      let lastIndex = index
      discard(/ /)
      if (isOneOf('\n', ']', '|', ';')) {
        return { nodes, assocs }
      } else {
        const { association, target } = parseAssociation(node)
        assocs.push(association)
        addNode(nodes, target)
        node = target
      }
      if (index === lastIndex) throw new Error('Infinite loop')
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
      let lastIndex = index
      if (isOneOf('\\')) {
        pop()
        startLabel += transformEscapes(pop())
      }
      if (isOneOf('(o-', '(-', 'o<-', 'o-', '+-', '<:-', '<-', '-')) break
      else if (isOneOf('[', ']', '|', '<', '>', ';')) error('label', source[index])
      else startLabel += pop()
      if (index === lastIndex) throw new Error('Infinite loop')
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
    while (source[index] == '|') {
      let lastIndex = index
      pop()
      parts.push(parsePart())
      if (lastIndex === index) throw new Error('Infinite loop')
    }
    if (source[index] == ']') {
      pop()
      discard(/ /)
      return { parts: parts, attr, id: attr.id ?? parts[0].lines[0], type }
    }
    error(']', source[index])
  }

  function parseLine(): string {
    const chars: string[] = []
    while (index < source.length) {
      let lastIndex = index
      if (source[index] === '\\') {
        pop()
        chars.push(transformEscapes(pop()))
      } else if (source[index].match(/[\[\]|;\n]/)) {
        break
      } else {
        chars.push(pop())
      }
      if (lastIndex === index) throw new Error('Infinite loop')
    }
    return chars.join('')
  }

  function parseMeta(): { type: string; attr: Attrs } {
    index++
    const type = consume(/[a-zA-Z0-9_]/)
    const char = pop()
    if (char == '>') return { type, attr: {} }
    if (char != ' ') error([' ', '>'], char)
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
    error([' ', '>'], char)
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
    if (!optional && start == end) error(regex, source[index])
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
    const maxPatternLength = Math.max(...patterns.map((e) => e.length))
    if (index + 1 >= source.length) error(patterns, undefined)
    else error(patterns, source.slice(index + 1, maxPatternLength))
  }

  function error(expected: Pattern, actual: string | undefined): never {
    throw new ParseError(expected, actual, line, index - lineStartIndex)
  }
}

type Pattern = string | undefined | RegExp | string[]

function serializeValue(value: Pattern): string {
  if (value == null) return 'end of file'
  if (value instanceof RegExp) return value.toString().slice(1, -1)
  if (Array.isArray(value)) return value.map(serializeValue).join(' or ')
  return JSON.stringify(value)
}

export class ParseError extends Error {
  expected: string | undefined | RegExp
  actual: string
  line: number
  column: number

  constructor(expected: Pattern, actual: string | undefined, line: number, column: number) {
    const exp = serializeValue(expected)
    const act = serializeValue(actual)
    super(`Parse error at line ${line} column ${column}, expected ${exp} but got ${act}`)
    this.expected = exp
    this.actual = act
    this.line = line
    this.column = column
  }
}
