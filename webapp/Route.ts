class Route {
  constructor(
    public context: string,
    public path: string
  ){}
  static from(hash: string): Route {
    var slashIndex = hash.indexOf('/')
    if (hash[0] == '#' && slashIndex > -1) {
      return {
        context: decodeURIComponent(hash.substr(1, slashIndex-1)),
        path: decodeURIComponent(hash.substr(slashIndex+1))
      }
    }
    return { context: null, path: null }
  }
}