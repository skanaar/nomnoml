export function range([min, max]: [min: number, max: number], count: number): number[] {
  const output = []
  for (let i = 0; i < count; i++) output.push(min + ((max - min) * i) / (count - 1))
  return output
}
export function sum<T>(list: ArrayLike<T>, transform: (item: T) => number) {
  let summa = 0
  for (let i = 0, len = list.length; i < len; i++) summa += transform(list[i])
  return summa
}
export function last<T>(list: T[]) {
  return list[list.length - 1]
}
export function indexBy<T>(list: T[], key: keyof T): { [key: string]: T } {
  const obj: { [key: string]: T } = {}
  for (let i = 0; i < list.length; i++) obj[list[i][key] as any] = list[i]
  return obj
}
