function isEqual(a, b) {
  function compare(a, b) {
    for (var k in a) {
      if (a.hasOwnProperty(k) && !isEqual(a[k], b[k])) return false
    }
    return true
  }
  switch (typeof a) {
    case 'undefined':
    case 'boolean':
    case 'number':
    case 'string':
    case 'symbol':
      return a === b
    case 'function':
      return typeof a === typeof b
    case 'object':
    default:
      if (a === null || b === null || b === undefined) return a === b
      return compare(a, b) && compare(b, a)
  }
}

function highlightDiff(a, b) {
  let start = 0
  let end = 0
  for (let i = 0; i < Math.min(a.length, b.length); i++)
    if (a[i] === b[i]) start++
    else break
  for (let i = 1; i < Math.min(a.length, b.length); i++)
    if (a[a.length - i] === b[b.length - i]) end++
    else break

  if (typeof process === 'undefined')
    return {
      a: `...${a.substring(start, a.length - end)}...`,
      b: `...${b.substring(start, b.length - end)}...`,
    }

  return {
    a: `${a.substring(0, start)}\x1b[41m${a.substring(start, a.length - end)}\x1b[0m${a.substring(
      a.length - end
    )}`,
    b: `${b.substring(0, start)}\x1b[41m${b.substring(start, b.length - end)}\x1b[0m${b.substring(
      b.length - end
    )}`,
  }
}

function assert(a, operator, b) {
  function json(obj) {
    return JSON.stringify(sortProperties(obj))
  }
  function fatal(sym) {
    var ajson = json(a)
    var bjson = json(b)
    var diff = highlightDiff(ajson, bjson)
    throw new Error('\n' + diff.a + '\n' + sym + '\n' + diff.b)
  }
  switch (operator) {
    case '=':
      if (!isEqual(a, b)) fatal('≠')
      break
    case '≠':
    case '!=':
      if (isEqual(a, b)) fatal('=')
      break
    case '>':
      if (a <= b) fatal('≯')
      break
    case '<':
      if (a >= b) fatal('≮')
      break
    case 'includes':
      if (!a.includes(b)) fatal('does not include')
      break
    case 'throws':
      var didThrow = false
      try {
        a()
      } catch (e) {
        didThrow = e instanceof b
      }
      if (!didThrow) throw new Error('Function did not throw an ' + b)
      break
    default:
      throw new Error('bad assert operator ', operator)
  }
}

function deepEqual(a, b) {
  assert(a, '=', b)
}

module.exports = { assert, deepEqual }
