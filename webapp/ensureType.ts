function ensureType(template: any, obj: any): any {
  if (Array.isArray(template)){
    if (Array.isArray(obj)) {
      if (template.length == 0) {
        return obj
      } else {
        return obj.map(e => ensureType(template[0], e)).filter(e => e !== undefined)
      }
    } else {
      return undefined
    }
  }
  if ('number' == typeof template) {
    return ('number' == typeof obj) ? obj : undefined
  }
  if ('string' == typeof template) {
    return ('string' == typeof obj) ? obj : undefined
  }
  if ('boolean' == typeof template) {
    return ('boolean' == typeof obj) ? obj : undefined
  }
  if ('object' == typeof template) {
    if ('object' == typeof obj) {
      for (var key in template) {
        if (ensureType(template[key], obj[key]) === undefined)
          return undefined
      }
      return obj
    }
  }
  return undefined
}

function assert(actual: any) {
  return { equal(expected: any) { equal(actual, expected) } }
}

function equal(a: any, b: any) {
  if (a === b) return
  var as = JSON.stringify(a)
  var bs = JSON.stringify(b)
  if (as !== bs)
    throw new Error(as + ' != ' + bs)
}

function test_ensureType() {
  assert(ensureType([], [])).equal([])
  assert(ensureType([], [0])).equal([0])
  assert(ensureType([0], [])).equal([])
  assert(ensureType([0], [0])).equal([0])
  assert(ensureType({a:''}, {a:''})).equal({a:''})
  assert(ensureType({a:''}, {a:0})).equal(undefined)
  assert(ensureType([{a:''}], [{a:0}])).equal([])
}
