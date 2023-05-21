CodeMirror.defineMode('nomnoml', () => ({
  startState() {
    return {}
  },
  token(stream, state) {
    if (stream.sol()) {
      stream.eatSpace()
      if (stream.peek() === '#') {
        stream.skipToEnd()
        return 'meta'
      }
      if (stream.match('//')) {
        stream.skipToEnd()
        return 'comment'
      }
    }

    var delimiters = '[]|;'.split('')
    var operator = '<>()+-:'.split('')
    var all = [...delimiters, ...operator]

    if (stream.peek() === '<') {
      stream.eat('<')
      if (stream.skipTo('>')) {
        stream.eat('>')
        return 'keyword'
      }
      return null
    }

    if (delimiters.some((c) => stream.eat(c))) return 'bracket'
    if (operator.some((c) => stream.eat(c))) return 'operator'
    stream.eatWhile((c) => all.indexOf(c) === -1)
    return null
  },
}))
