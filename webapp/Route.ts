export class Route {
  constructor(
    public context: string,
    public path: string
  ){}

  static from(hash: string): Route {
    var slashIndex = hash.indexOf('/')
    if (hash[0] == '#' && slashIndex > -1) {
      return {
        context: Route.urlDecode(hash.substr(1, slashIndex-1)),
        path: Route.urlDecode(hash.substr(slashIndex+1))
      }
    }
    return { context: '', path: '' }
  }

  // Adapted from http://meyerweb.com/eric/tools/dencoder/
  static urlEncode(unencoded: string) {
    return encodeURIComponent(unencoded).replace(/'/g,'%27').replace(/"/g,'%22')
  }

  static urlDecode(encoded: string) {
    return decodeURIComponent(encoded.replace(/\+/g, ' '))
  }
}