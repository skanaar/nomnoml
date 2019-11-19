import { CanvasPanner } from "./CanvasPanner"
import { DevEnv } from "./DevEnv"
import { DownloadLinks } from "./DownloadLinks"
import { FileEntry, FileSystem, StoreLocal } from "./FileSystem"
import { HoverMarker } from "./HoverMarker"
import { Observable } from "./Observable"
import { throttle, debounce, unescapeHtml } from "./util"
// @ts-ignore
import * as nomnoml from "../dist/nomnoml.js"

export class App {
  panner: CanvasPanner
  filesystem: FileSystem
  defaultSource: string
  editor: CodeMirrorEditor
  sourceChanged: () => void
  downloader: DownloadLinks
  dynamicButton: any = null
  signals: Observable = new Observable()
  on = this.signals.on
  off = this.signals.off

  constructor(codeMirror: CodeMirror) {
    var body = document.querySelector('body')
    var lineNumbers = document.getElementById('linenumbers')
    var lineMarker = document.getElementById('linemarker')
    var textarea = document.getElementById('textarea') as HTMLTextAreaElement
    var canvasElement = document.getElementById('canvas') as HTMLCanvasElement
    var canvasPanner = document.getElementById('canvas-panner')

    this.editor = codeMirror.fromTextArea(textarea, {
      lineNumbers: true,
      mode: 'nomnoml',
      matchBrackets: true,
      theme: 'solarized light',
      keyMap: 'sublime'
    })

    this.editor.on('drop', (cm: any, dragEvent: DragEvent) => {
      var files = dragEvent.dataTransfer.files
      if (files[0].type == 'image/svg+xml') {
        dragEvent.preventDefault()
        this.handleOpeningFiles(files)
      }
    })

    var editorElement = this.editor.getWrapperElement()

    this.filesystem = new FileSystem()
    var devenv = new DevEnv(editorElement, lineMarker, lineNumbers)
    this.panner = new CanvasPanner(canvasPanner, () => this.sourceChanged())
    this.downloader = new DownloadLinks(canvasElement)
    new HoverMarker('canvas-mode', body, [canvasPanner])

    this.defaultSource = (document.getElementById('defaultGraph') || { innerHTML: '' }).innerHTML

    var lastValidSource: string = null

    var reloadStorage = async () => {
      lastValidSource = null
      await this.filesystem.configureByRoute(location.hash)
      try {
        var source = await this.filesystem.storage.read()
        this.editor.setValue(source || '')
        this.sourceChanged()
      } catch(e) { console.log(e) }
    }

    window.addEventListener('hashchange', () => reloadStorage());
    window.addEventListener('resize', throttle(() => this.sourceChanged(), 750, {leading: true}))
    this.editor.on('changes', debounce(() => this.sourceChanged(), 300))
    
    async function loadFile(key: string): Promise<string> {
      var storage = new StoreLocal(key)
      return storage.read()
    }
    
    function safelyProcessSource(source: string) {
      try {
        return nomnoml.processAsyncImports(source, loadFile)
      } catch(e) {
        if (e instanceof nomnoml.ImportDepthError) {
          return 'Error: too many imports'
        } else {
          throw e
        }
      }
    }

    this.sourceChanged = async () => {
      try {
        this.signals.trigger('compile-error', null)
        devenv.clearState()
        var source = this.editor.getValue()
        var processedSource = await safelyProcessSource(source)
        var model = nomnoml.draw(canvasElement, processedSource, this.panner.zoom())
        lastValidSource = source
        this.panner.positionCanvas(canvasElement)
        this.filesystem.storage.save(source)
        this.downloader.source = source
        this.downloader.setFilename(model.config.title || this.filesystem.activeFile.name)
        this.signals.trigger('source-changed', source)
      } catch (e){
        this.signals.trigger('compile-error', e)
        // Rerender canvas with last successfully rendered text.
        if (lastValidSource) {
          nomnoml.draw(canvasElement, lastValidSource, this.panner.zoom())
        }
        this.panner.positionCanvas(canvasElement)
        devenv.setError(e)
      }
    }

    reloadStorage()
  }

  loadSvg(svg: string) {
    var svgNodes = (new DOMParser()).parseFromString(svg,'text/xml')
    if(svgNodes.getElementsByTagName('desc').length !== 1) {
      alert("SVG did not have nomnoml code embedded within it.")
      return
    }
    var code = svgNodes.getElementsByTagName('desc')[0].childNodes[0].nodeValue
    code = unescapeHtml(code)
    this.editor.setValue(code)
  }

  currentSource(): string {
    return this.editor.getValue()
  }

  magnifyViewport(diff: number){
    this.panner.magnify(diff)
  }

  resetViewport(){
    this.panner.reset()
  }

  toggleSidebar(id: string){
    var sidebars = ['about', 'reference', 'export', 'files']
    for(var key of sidebars){
      if (id !== key)
        document.getElementById(key).classList.remove('visible')
    }
    document.getElementById(id).classList.toggle('visible')
  }

  discardCurrentGraph(){
    if (confirm('Do you want to discard current diagram and load the default example?')){
      this.editor.setValue(this.defaultSource)
      this.sourceChanged()
    }
  }

  saveAs() {
    var name = prompt('Name your diagram')
    var source = this.currentSource()
    if (name) {
      this.filesystem.storage.files().then(files => {
        if (files.some((e: FileEntry) => e.name === name)) {
          alert('A file named '+name+' already exists.')
        } else {
          this.filesystem.moveToFileStorage(name, source)
          location.href = '#file/' + encodeURIComponent(name)
        }
      })
    }
  }

  exitViewMode(){
    window.location.href = './'
  }

  handleOpeningFiles(files: FileList) {
    if(files.length !== 1) {
      alert('You can only upload one file at a time.')
      return
    }
    var reader = new FileReader()
    reader.onload = () => this.loadSvg(reader.result as string)
    reader.readAsText(files[0])
  }
}
