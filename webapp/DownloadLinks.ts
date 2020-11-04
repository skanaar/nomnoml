// @ts-ignore
import saveAs from "file-saver"
// @ts-ignore
import * as nomnoml from "../dist/nomnoml.js"

export class DownloadLinks {

  filename: string = 'graph'
  source: string = ''
  
  constructor(private canvasElement: HTMLCanvasElement) {}

  pngDownload(){
    var dynamic: any = this.canvasElement
    if (!!dynamic.msToBlob) {
      saveAs(dynamic.msToBlob(), this.filename + '.png')
    }
    else {
      this.canvasElement.toBlob((blob: Blob) => saveAs(blob, this.filename + '.png'))
    }
  }

  svgDownload(){
    var svg = nomnoml.renderSvg(this.source, document)
    saveAs(new Blob([svg], {type: 'image/svg+xml'}), this.filename + '.svg')
  }

  srcDownload(){
    var src = this.source
    saveAs(new Blob([src], {type: 'text/txt'}), this.filename + '.nomnoml')
  }

  setFilename(filename: string): void {
    filename = filename || 'nomnoml'
    this.filename = filename.replace(/[^ a-zA-Z0-9_-]/g, '_')
  }
}