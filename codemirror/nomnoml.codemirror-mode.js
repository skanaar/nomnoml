CodeMirror.defineMode('nomnoml', function() {
  return {
    startState: function() { return { inSymbol: false } },
    token: function(stream, state) {
      if (stream.sol()){
        stream.eatSpace()
        if (stream.peek() === '#'){
          stream.skipToEnd()
          return 'meta'
        }
        if (stream.match('//')){
          stream.skipToEnd()
          return 'comment'
        }
      }

      var delimiters = '[]|'.split('')
      var operator = '>+-:;'.split('')
      var all = [].concat(delimiters, operator)

      if (stream.peek() === '<'){
        stream.eat('<')
        if (stream.skipTo('>')) {
          stream.eat('>')
          return 'keyword'
        }
        return null
      }

      if (delimiters.some(function (c){ return stream.eat(c) }))
        return 'bracket'
      if (operator.some(function (c){ return stream.eat(c) }))
        return 'operator'
      stream.eatWhile(function (c){ return all.indexOf(c) === -1 })
      return null;
    }
  };
});
