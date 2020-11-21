import type { Config, Measurer } from "./domain"
import { Graphics } from "./Graphics";
import { layout } from "./layouter";
import { parse } from "./parser";
import { render } from "./renderer";
import { GraphicsCanvas } from "./GraphicsCanvas";
import { GraphicsSvg } from "./GraphicsSvg";

interface Rect { width: number, height: number }

function fitCanvasSize(canvas: HTMLCanvasElement, rect: Rect, zoom: number) {
  canvas.width = rect.width * zoom;
  canvas.height = rect.height * zoom;
}

function createMeasurer(config: Config, graphics: Graphics): Measurer {
  return {
    setFont(conf: Config, bold: 'bold'|'normal', ital:'italic'|null): void {
      graphics.setFont(conf.font, bold, ital ?? null, config.fontSize)
    },
    textWidth: function (s: string): number { return graphics.measureText(s).width },
    textHeight: function (): number { return config.leading * config.fontSize }
  }
};

function parseAndRender(code: string, graphics: Graphics, canvas: HTMLCanvasElement|null, scale: number) {
  var parsedDiagram = parse(code)
  var config = parsedDiagram.config
  var measurer = createMeasurer(config, graphics)
  var graphLayout = layout(measurer, config, parsedDiagram.root)
  if (canvas) { fitCanvasSize(canvas, graphLayout, config.zoom * scale) }
  config.zoom *= scale
  render(graphics, config, graphLayout, measurer.setFont)
  return { config: config, layout: graphLayout }
}

export function draw(canvas: HTMLCanvasElement, code: string, scale?: number): { config: Config } {
  return parseAndRender(code, GraphicsCanvas(canvas), canvas, scale || 1)
}

export function renderSvg(code: string, document?: HTMLDocument): string {
  var skCanvas = GraphicsSvg('', document)
  var { config, layout } = parseAndRender(code, skCanvas, null, 1)
  return skCanvas.serialize({
    width: layout.width,
    height: layout.height
  }, code, config.title)
}

export class ImportDepthError extends Error {
  constructor() {
    super('max_import_depth exceeded')
  }
}

type FileLoaderAsync = (filename: string) => Promise<string>

export async function processAsyncImports(source: string, loadFile: FileLoaderAsync, maxImportDepth: number = 10): Promise<string> {

  if (maxImportDepth == -1) {
    throw new ImportDepthError()
  }
  
  async function lenientLoadFile(key: string): Promise<string> {
    try { return (await loadFile(key)) || '' }
    catch(e) { return '' }
  }
  
  var imports: { file: string, promise: Promise<string> }[] = []
  
  source.replace(/#import: *(.*)/g, function (a: any, file: string) {
    var promise = lenientLoadFile(file).then(contents => processAsyncImports(contents, loadFile, maxImportDepth-1))
    imports.push({ file, promise })
    return ''
  })
  
  var imported: Record<string, string> = {}
  for(var imp of imports) {
    imported[imp.file] = await imp.promise
  }
  
  return source.replace(/#import: *(.*)/g, function (a: any, file: string) {
    return imported[file]
  })
}

type FileLoader = (filename: string) => string

export function processImports(source: string, loadFile: FileLoader, maxImportDepth: number = 10): string {

  if (maxImportDepth == -1) {
    throw new ImportDepthError()
  }
  
  function lenientLoadFile(key: string) {
    try { return loadFile(key) || '' }
    catch(e) { return '' }
  }
  
  return source.replace(/#import: *(.*)/g, function (a: any, file: string) {
    return processImports(lenientLoadFile(file), loadFile, maxImportDepth-1)
  })
}

export function compileFile(filepath: string, maxImportDepth?: number): string {
  var fs = require('fs')
  var path = require('path')

  var directory = path.dirname(filepath)
  var rootFileName = filepath.substr(directory.length)
  
  function loadFile(filename: string): string {
    return fs.readFileSync(path.join(directory, filename), {encoding:'utf8'})
  }
  
  return processImports(loadFile(rootFileName), loadFile, maxImportDepth)
}
