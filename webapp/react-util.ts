export function prevent<T extends { preventDefault(): void }, U>(func: (e: T) => U) {
  return function (e: T) {
    e.preventDefault()
    func(e)
  }
}
