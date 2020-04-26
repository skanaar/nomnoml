namespace nomnoml {

  export class ImportDepthError extends Error {
    constructor() {
      super('max_import_depth exceeded')
    }
  }

  export function compileFile(filepath: string, maxImportDepth: number, depth?: number): string {
    var fs = require('fs')
    var path = require('path')

    if (depth > maxImportDepth) {
      throw new ImportDepthError()
    }

    var source = fs.readFileSync(filepath, {encoding:'utf8'})
    var directory = path.dirname(filepath)

    return source.replace(/#import: *(.*)/g, function (a: any, file: string) {
      return compileFile(path.join(directory, file), depth+1)
    })
  }

}