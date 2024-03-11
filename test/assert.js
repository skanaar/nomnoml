function assertEqual(a, b, path = []) {
  function fatal(lhs, rhs) {
    throw new Error(`${path.join('.')}: ${JSON.stringify(lhs)} ≠ ${JSON.stringify(rhs)}`)
  }
  function compare(a, b) {
    for (const k in a) {
      if (a.hasOwnProperty(k)) assertEqual(a[k], b[k], [...path, k])
    }
  }
  switch (typeof a) {
    case 'undefined':
    case 'boolean':
    case 'number':
    case 'string':
    case 'symbol':
      if (a !== b) fatal(a, b)
      else return
    case 'function':
      if (typeof a !== typeof b) fatal(a, b)
      else return
    case 'object':
    default:
      if (a == null && b != null) fatal(a, b)
      if (a != null && b == null) fatal(a, b)
      compare(a, b)
      compare(b, a)
  }
}

function assert(a, operator, b) {
  function fatal(msg) {
    console.log(msg)
    throw new Error(msg)
  }
  switch (operator) {
    case '=':
      assertEqual(a, b)
      break
    case '>':
      if (a <= b) fatal(`${a} !< ${b}`)
      break
    case '<':
      if (a >= b) fatal(`${a} !> ${b}`)
      break
    case 'includes':
      if (!a.includes(b)) fatal(`array does not include ${b}`)
      break
    case 'throws':
      var didThrow = false
      try {
        a()
      } catch (e) {
        didThrow = e instanceof b
      }
      if (!didThrow) fatal('Function did not throw ' + b.name)
      break
    default:
      fatal('bad assert operator ', operator)
  }
}

function deepEqual(a, b) {
  assertEqual(a, b)
}

module.exports = { assert, deepEqual }
