interface Nomnoml {
  version: string
  draw(canvas: HTMLCanvasElement, code: string, scale: number): { config: Config }
  render(graphics: Graphics, config: Config, compartment: nomnoml.Compartment, setFont: nomnoml.SetFont): void
  renderSvg(code: string, docCanvas?: HTMLCanvasElement): string
  parse(source: string): any
  intermediateParse(source: string): nomnoml.AstRoot
  transformParseIntoSyntaxTree(entity: nomnoml.AstRoot): nomnoml.Compartment
  layout(measurer: Measurer, config: Config, ast: nomnoml.Compartment): nomnoml.Compartment
  styles: { [key: string]: Style }
  visualizers: { [key: string]: Visualizer }
}

namespace nomnoml {

  export interface SetFont {
    (config: Config, isBold: string, isItalic?: string): void
  }

  interface Rect { width: number, height: number }

  function fitCanvasSize(canvas: HTMLCanvasElement, rect: Rect, zoom: number) {
    canvas.width = rect.width * zoom;
    canvas.height = rect.height * zoom;
  }

  function setFont(config: Config, isBold: 'bold'|'normal', isItalic: 'italic'|undefined, graphics: Graphics) {
    var style = (isBold === 'bold' ? 'bold' : '')
    if (isItalic) style = 'italic ' + style
    var defaultFont = 'Helvetica, sans-serif'
    var font = skanaar.format('# #pt #, #', style, config.fontSize, config.font, defaultFont)
    graphics.font(font)
  }

  function parseAndRender(code: string, graphics: Graphics, canvas: HTMLCanvasElement, scale: number) {
    var parsedDiagram = parse(code)
    var config = parsedDiagram.config
    var measurer = {
      setFont(conf: Config, bold: 'bold'|'normal', ital:'italic'|undefined): void {
        setFont(conf, bold, ital, graphics)
      },
      textWidth(s: string): number { return graphics.measureText(s).width },
      textHeight(): number { return config.leading * config.fontSize }
    };
    var layout = nomnoml.layout(measurer, config, parsedDiagram.root)
    fitCanvasSize(canvas, layout, config.zoom * scale)
    config.zoom *= scale
    nomnoml.render(graphics, config, layout, measurer.setFont)
    return { config: config }
  }

  export var version = '0.5.0'

  export function draw(canvas: HTMLCanvasElement, code: string, scale: number): { config: Config } {
    return parseAndRender(code, skanaar.Canvas(canvas), canvas, scale || 1)
  }

  export function renderSvg(code: string, docCanvas?: HTMLCanvasElement): string {
    var parsedDiagram = parse(code)
    var config = parsedDiagram.config
    var skCanvas = skanaar.Svg('', docCanvas)
    function setFont(config: Config, isBold: 'bold'|'normal', isItalic: 'italic'|undefined) {
      var style = (isBold === 'bold' ? 'bold' : '')
      if (isItalic) style = 'italic ' + style
      var defFont = 'Helvetica, sans-serif'
      var template = 'font-weight:#; font-size:#pt; font-family:\'#\', #'
      var font = skanaar.format(template, style, config.fontSize, config.font, defFont)
      skCanvas.font(font)
    }
    var measurer = {
      setFont(conf: Config, bold: 'bold'|'normal', ital:'italic'|undefined): void {
        setFont(conf, bold, ital)
      },
      textWidth: function (s: string): number { return skCanvas.measureText(s).width },
      textHeight: function (): number { return config.leading * config.fontSize }
    };
    var layout = nomnoml.layout(measurer, config, parsedDiagram.root)
    
    nomnoml.render(skCanvas, config, layout, measurer.setFont)
    return skCanvas.serialize({
      width: layout.width,
      height: layout.height
    })
  }
}
