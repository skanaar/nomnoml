interface Observable {
  on(name: string, fn: any): Observable
  off(name: string, fn?: any): Observable
  trigger(name: string, ...args: any[]): Observable
}

function Observable(observable: any = {}): Observable { // eslint-disable-line

  var callbacks = new Map<string, Set<Function>>()

  function on(event: string, fn: Function) {
    if (callbacks.has(event)) {
      callbacks.get(event).add(fn)
    } else {
      var fns = new Set<Function>()
      fns.add(fn)
      callbacks.set(event, fns)
    }
    return observable
  }

  function off(event: string, fn?: Function) {
    if (fn) {
      var fns: Set<Function> = callbacks.get(event)
      if (fns) {
        fns.delete(fn)
        if (fns.size === 0) callbacks.delete(event)
      }
    } else callbacks.delete(event)
    return observable
  }

  function trigger(event: string, ...args: any[]) {
    var fns: Set<Function> = callbacks.get(event)
    if (fns) fns.forEach((fn: Function) => fn.apply(null, args))
    return observable
  }

  Object.defineProperties(observable, {
    on: { value: on, enumerable: false, writable: false, configurable: false },
    off: { value: off, enumerable: false, writable: false, configurable: false },
    trigger: { value: trigger, enumerable: false, writable: false, configurable: false }
  })

  return observable as Observable
}
