var el = React.createElement;

var div = (...args: any[]) => el('div', ...args)
var span = (...args: any[]) => el('span', ...args)
var pre = (...args: any[]) => el('pre', ...args)
var b = (...args: any[]) => el('b', ...args)
var h2 = (...args: any[]) => el('h2', ...args)
var label = (...args: any[]) => el('label', ...args)
var hr = (...args: any[]) => el('label', ...args)
var a = (...args: any[]) => el('a', ...args)
var input = (...args: any[]) => el('input', ...args)

function prevent(func: Function) {
    return function (e: Event) {
      e.preventDefault()
      func(e)
    }
  }