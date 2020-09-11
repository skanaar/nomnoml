interface Nomnoml {
  version: string
  draw(canvas: HTMLCanvasElement, code: string, scale: number): { config: Config }
  render(graphics: Graphics, config: Config, compartment: nomnoml.Compartment, setFont: nomnoml.SetFont): void
  renderSvg(code: string, docCanvas?: HTMLCanvasElement): string
  parse(source: string):  { root: nomnoml.Compartment; config: Config }
  intermediateParse(source: string): nomnoml.AstRoot
  transformParseIntoSyntaxTree(entity: nomnoml.AstRoot): nomnoml.Compartment
  layout(measurer: Measurer, config: Config, ast: nomnoml.Compartment): nomnoml.Compartment
  styles: { [key: string]: Style }
  visualizers: { [key: string]: Visualizer }
}

namespace nomnoml {

  export var version = '1.0.1'

  export interface SetFont {
    (config: Config, isBold: string, isItalic?: string): void
  }

  interface Rect { width: number, height: number }

  function fitCanvasSize(canvas: HTMLCanvasElement, rect: Rect, zoom: number) {
    canvas.width = rect.width * zoom;
    canvas.height = rect.height * zoom;
  }

  function Measurer(config: Config, graphics: Graphics) {
    return {
      setFont(conf: Config, bold: 'bold'|'normal', ital:'italic'|undefined): void {
        graphics.setFont(conf.font, bold, ital, config.fontSize)
      },
      textWidth: function (s: string): number { return graphics.measureText(s).width },
      textHeight: function (): number { return config.leading * config.fontSize }
    }
  };

  function parseAndRender(code: string, graphics: Graphics, canvas: HTMLCanvasElement, scale: number) {
    var parsedDiagram = parse(code)
    var config = parsedDiagram.config
    var measurer = Measurer(config, graphics)
    var layout = nomnoml.layout(measurer, config, parsedDiagram.root)
    if (canvas) { fitCanvasSize(canvas, layout, config.zoom * scale) }
    config.zoom *= scale
    nomnoml.render(graphics, config, layout, measurer.setFont)
    return { config: config, layout: layout }
  }

  export function draw(canvas: HTMLCanvasElement, code: string, scale: number): { config: Config } {
    return parseAndRender(code, skanaar.Canvas(canvas), canvas, scale || 1)
  }

  export function renderSvg(code: string, document?: HTMLDocument): string {
    var skCanvas = skanaar.Svg('', document)
    var { config, layout } = parseAndRender(code, skCanvas, null, 1)
    return skCanvas.serialize({
      width: layout.width,
      height: layout.height
    }, code, config.title)
  }
}
