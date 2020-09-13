namespace nomnoml {

  export class ImportDepthError extends Error {
    constructor() {
      super('max_import_depth exceeded')
    }
  }

  export function compileFile(filepath: string, maxImportDepth: number, depth: number): string {
    var fs = require('fs')
    var path = require('path')

    var directory = path.dirname(filepath)
    var rootFileName = filepath.substr(directory.length)
    
    function loadFile(filename: string): string {
      return fs.readFileSync(path.join(directory, filename), {encoding:'utf8'})
    }
    
    return processImports(loadFile(rootFileName), loadFile, maxImportDepth)
  }

}