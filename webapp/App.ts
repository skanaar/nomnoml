class App {
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

  constructor(
    nomnoml: Nomnoml,
    codeMirror: CodeMirror,
    saveAs: (blob: Blob, name: string) => void,
    private _: Underscore
  ) {
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
    this.panner = new CanvasPanner(canvasPanner, () => this.sourceChanged(), _.throttle)
    this.downloader = new DownloadLinks(canvasElement, saveAs)
    new HoverMarker('canvas-mode', body, [canvasPanner])

    this.defaultSource = (document.getElementById('defaultGraph') || { innerHTML: '' }).innerHTML

    var lastValidSource: string = null

    var reloadStorage = () => {
      lastValidSource = null
      this.filesystem.configureByRoute(location.hash)
      var source = this.filesystem.storage.read() || ''
      this.editor.setValue(source || this.defaultSource)
      this.sourceChanged()
    }

    window.addEventListener('hashchange', () => reloadStorage());
    window.addEventListener('resize', _.throttle(() => this.sourceChanged(), 750, {leading: true}))
    this.editor.on('changes', _.debounce(() => this.sourceChanged(), 300))
    
    function loadFile(key: string): string {
      var storage = new LocalFileGraphStore(key)
      return storage.read()
    }
    
    function safelyProcessSource(source: string) {
      try {
        return nomnoml.processImports(source, loadFile)
      } catch(e) {
        if (e instanceof nomnoml.ImportDepthError) {
          return 'Error: too many imports'
        } else {
          throw e
        }
      }
    }

    this.sourceChanged = () => {
      try {
        this.signals.trigger('compile-error', null)
        devenv.clearState()
        var source = this.editor.getValue()
        var processedSource = safelyProcessSource(source)
        var model = nomnoml.draw(canvasElement, processedSource, this.panner.zoom())
        lastValidSource = source
        this.panner.positionCanvas(canvasElement)
        this.filesystem.storage.save(source)
        this.downloader.source = source
        this.downloader.setFilename(model.config.title)
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
    code = this._.unescape(code)
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

  saveViewModeToStorage(){
    var question =
      'Do you want to overwrite the diagram in ' +
      'localStorage with the currently viewed diagram?'
    if (confirm(question)){
      this.filesystem.moveToLocalStorage(this.currentSource())
      window.location.href = './'
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
