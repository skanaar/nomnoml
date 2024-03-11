import type { Config, Measurer } from './domain'
import { Graphics } from './Graphics'
import { layout } from './layouter'
import { parse } from './parser'
import { render } from './renderer'
import { GraphicsCanvas } from './GraphicsCanvas'
import { GraphicsSvg } from './GraphicsSvg'

interface Rect {
  width: number
  height: number
}

function fitCanvasSize(canvas: HTMLCanvasElement, rect: Partial<Rect>, zoom: number) {
  canvas.width = rect.width! * zoom
  canvas.height = rect.height! * zoom
}

function createMeasurer(config: Config, graphics: Graphics): Measurer {
  return {
    setFont(
      family: string,
      size: number,
      weight: 'bold' | 'normal',
      style: 'italic' | 'normal'
    ): void {
      graphics.setFont(family, size, weight, style)
    },
    textWidth(s: string): number {
      return graphics.measureText(s).width
    },
    textHeight(): number {
      return config.leading * config.fontSize
    },
  }
}

function parseAndRender(
  code: string,
  graphics: Graphics,
  canvas: HTMLCanvasElement | null,
  scale: number
) {
  const parsedDiagram = parse(code)
  const config = parsedDiagram.config
  const measurer = createMeasurer(config, graphics)
  const graphLayout = layout(measurer, config, parsedDiagram.root)
  if (canvas) {
    fitCanvasSize(canvas, graphLayout, config.zoom * scale)
  }
  config.zoom *= scale
  render(graphics, config, graphLayout)
  return { config: config, layout: graphLayout }
}

export function draw(canvas: HTMLCanvasElement, code: string, scale?: number): { config: Config } {
  return parseAndRender(code, GraphicsCanvas(canvas), canvas, scale || 1)
}

export function renderSvg(code: string, document?: HTMLDocument): string {
  const skCanvas = GraphicsSvg(document)
  const { config, layout } = parseAndRender(code, skCanvas, null, 1)
  return skCanvas.serialize(
    {
      width: layout.width!,
      height: layout.height!,
    },
    code,
    config.title
  )
}

export class ImportDepthError extends Error {
  constructor() {
    super('max_import_depth exceeded')
  }
}

type FileLoaderAsync = (filename: string) => Promise<string>

export async function processAsyncImports(
  source: string,
  loadFile: FileLoaderAsync,
  maxImportDepth: number = 10
): Promise<string> {
  if (maxImportDepth == -1) {
    throw new ImportDepthError()
  }

  async function lenientLoadFile(key: string): Promise<string> {
    try {
      return (await loadFile(key)) || ''
    } catch (e) {
      return ''
    }
  }

  const imports: { file: string; promise: Promise<string> }[] = []

  source.replace(/#import: *(.*)/g, (a: unknown, file: string) => {
    const promise = lenientLoadFile(file).then((contents) =>
      processAsyncImports(contents, loadFile, maxImportDepth - 1)
    )
    imports.push({ file, promise })
    return ''
  })

  const imported: Record<string, string> = {}
  for (const imp of imports) {
    imported[imp.file] = await imp.promise
  }

  return source.replace(/#import: *(.*)/g, (a: unknown, file: string) => imported[file])
}

type FileLoader = (filename: string) => string

export function processImports(
  source: string,
  loadFile: FileLoader,
  maxImportDepth: number = 10
): string {
  if (maxImportDepth == -1) {
    throw new ImportDepthError()
  }

  function lenientLoadFile(key: string) {
    try {
      return loadFile(key) || ''
    } catch (e) {
      return ''
    }
  }

  return source.replace(/#import: *(.*)/g, (a: unknown, file: string) =>
    processImports(lenientLoadFile(file), loadFile, maxImportDepth - 1)
  )
}

export function compileFile(filepath: string, maxImportDepth?: number): string {
  const fs = require('fs')
  const path = require('path')

  const directory = path.dirname(filepath)
  const rootFileName = filepath.substr(directory.length)

  function loadFile(filename: string): string {
    return fs.readFileSync(path.join(directory, filename), { encoding: 'utf8' })
  }

  return processImports(loadFile(rootFileName), loadFile, maxImportDepth)
}
