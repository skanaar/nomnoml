class DownloadLinks {

  filename: string = 'graph'
  source: string = ''
  
  constructor(
    private canvasElement: HTMLCanvasElement,
    private saveAs: (blob: Blob, name: string) => void
  ) {}

  pngDownload(){
    var dynamic: any = this.canvasElement
    if (!!dynamic.msToBlob) {
      this.saveAs(dynamic.msToBlob(), this.filename + '.png')
    }
    else {
      this.canvasElement.toBlob((blob: Blob) => this.saveAs(blob, this.filename + '.png'))
    }
  }

  svgDownload(){
    var dynamic: any = nomnoml
    var svg = dynamic.renderSvg(this.source, document)
    this.saveAs(new Blob([svg], {type: 'image/svg+xml'}), this.filename + '.svg')
  }

  srcDownload(){
    var src = this.source
    this.saveAs(new Blob([src], {type: 'text/txt'}), this.filename + '.nomnoml')
  }

  setFilename(filename: string): void {
    filename = filename || 'graph'
    this.filename = filename
  }
}