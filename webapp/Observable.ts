export class Observable {

  callbacks: { [key: string]: Function[] } = {}

  on(event: string, fn: Function): void {
    if (!this.callbacks[event]) {
      this.callbacks[event] = []
    }
    this.callbacks[event].push(fn)
  }

  off(event: string, fn: Function): void {
    var fns: Function[] = this.callbacks[event]
    if (fns) {
      var index = fns.indexOf(fn)
      if (index !== -1) fns.splice(index, 1)
      if (fns.length === 0) delete this.callbacks[event]
    }
  }

  trigger(event: string, ...args: any[]): void {
    var fns = this.callbacks[event]
    if (fns) for (let fn of fns) fn.apply(null, args)
  }
}
