import { createElement } from "react";

export var el = createElement;

export var div = (...args: any[]) => el('div', ...args)
export var span = (...args: any[]) => el('span', ...args)
export var pre = (...args: any[]) => el('pre', ...args)
export var b = (...args: any[]) => el('b', ...args)
export var h1 = (...args: any[]) => el('h1', ...args)
export var h2 = (...args: any[]) => el('h2', ...args)
export var label = (...args: any[]) => el('label', ...args)
export var hr = (...args: any[]) => el('label', ...args)
export var a = (...args: any[]) => el('a', ...args)
export var input = (...args: any[]) => el('input', ...args)

export function prevent(func: Function) {
  return function (e: Event) {
    e.preventDefault()
    func(e)
  }
}