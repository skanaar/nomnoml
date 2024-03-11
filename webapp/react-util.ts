import { createElement } from "react";

export const el = createElement;

export const div = (...args: any[]) => el('div', ...args)
export const span = (...args: any[]) => el('span', ...args)
export const pre = (...args: any[]) => el('pre', ...args)
export const b = (...args: any[]) => el('b', ...args)
export const h1 = (...args: any[]) => el('h1', ...args)
export const h2 = (...args: any[]) => el('h2', ...args)
export const label = (...args: any[]) => el('label', ...args)
export const hr = (...args: any[]) => el('label', ...args)
export const a = (...args: any[]) => el('a', ...args)
export const input = (...args: any[]) => el('input', ...args)

export function prevent(func: Function) {
  return function (e: Event) {
    e.preventDefault()
    func(e)
  }
}