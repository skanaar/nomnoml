class App {
  panner: CanvasPanner
  filesystem: FileSystem
  defaultSource: string
  editor: CodeMirrorEditor
  sourceChanged: () => void
  downloader: DownloadLinks
  signals: Observable = new Observable()
  on = this.signals.on
  off = this.signals.off

  constructor(
    nomnoml: Nomnoml,
    codeMirror: CodeMirror,
    public metrics: Metrics,
    saveAs: (blob: Blob, name: string) => void,
    throttle: Throttler,
    debounce: Throttler
  ) {
    var body = document.querySelector('body')
    var lineNumbers = document.getElementById('linenumbers')
    var lineMarker = document.getElementById('linemarker')
    var textarea = document.getElementById('textarea') as HTMLTextAreaElement
    var canvasElement = document.getElementById('canvas') as HTMLCanvasElement
    var canvasPanner = document.getElementById('canvas-panner')
    var canvasTools = document.getElementById('canvas-tools')

    this.editor = codeMirror.fromTextArea(textarea, {
      lineNumbers: true,
      mode: 'nomnoml',
      matchBrackets: true,
      theme: 'solarized light',
      keyMap: 'sublime'
    })

    this.editor.on('drop', (cm: any, dragEvent: DragEvent) => {
      var files = dragEvent.dataTransfer.files
      if(files.length !== 1)
        return alert('Only upload a single file.')
      if(files[0].type == 'image/svg+xml'){
        dragEvent.preventDefault()
        this.handleOpeningFiles(files)
      }
    })

    var editorElement = this.editor.getWrapperElement()

    this.filesystem = new FileSystem()
    var devenv = new DevEnv(editorElement, lineMarker, lineNumbers)
    this.panner = new CanvasPanner(canvasPanner, () => this.sourceChanged(), throttle)
    this.downloader = new DownloadLinks(canvasElement, saveAs)
    new HoverMarker('canvas-mode', body, [canvasPanner, canvasTools])
    new Tooltips(document.getElementById('tooltip'), document.querySelectorAll('.tools a'))

    this.defaultSource = (document.getElementById('defaultGraph') || { innerHTML: '' }).innerHTML

    var lastValidSource: string = null

    var reloadStorage = () => {
      lastValidSource = null
      this.filesystem.configureByRoute(location.hash)
      var source = this.filesystem.storage.read() || ''
      this.editor.setValue(source || this.defaultSource)

      try {
        metrics.track('load', {
          storage: this.filesystem.storage.kind,
          chars: source.length,
          lines: source.split('\n').length
        })
      } catch (e) {}

      this.sourceChanged()
    }

    window.addEventListener('hashchange', () => reloadStorage());
    window.addEventListener('resize', throttle(() => this.sourceChanged(), 750, {leading: true}))
    this.editor.on('changes', debounce(() => this.sourceChanged(), 300))

    this.sourceChanged = () => {
      try {
        devenv.clearState()
        var source = this.editor.getValue()
        var model = nomnoml.draw(canvasElement, source, this.panner.zoom())
        lastValidSource = source
        this.panner.positionCanvas(canvasElement)
        this.filesystem.storage.save(source)
        this.downloader.source = source
        this.downloader.setFilename(model.config.title)
        this.signals.trigger('source-changed', source)
      } catch (e){
        devenv.setError(e)
        // Rerender canvas with last successfully rendered text.
        if (lastValidSource) {
          nomnoml.draw(canvasElement, lastValidSource, this.panner.zoom())
        }
        this.panner.positionCanvas(canvasElement)
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
    code = code.replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    this.editor.setValue(code)
  }

  currentSource(): string {
    return this.editor.getValue()
  }

  magnifyViewport(diff: number){
    this.metrics.track('viewport_magnify', { direction: diff })
    this.panner.magnify(diff)
  }

  resetViewport(){
    this.metrics.track('viewport_reset')
    this.panner.reset()
  }

  toggleSidebar(id: string){
    this.metrics.track('toggle_sidebar', { sidebar: id })
    var sidebars = ['about', 'reference', 'export', 'files']
    for(var key of sidebars){
      if (id !== key)
        document.getElementById(key).classList.remove('visible')
    }
    document.getElementById(id).classList.toggle('visible')
    document.getElementById('file-system-hint').classList.add('hidden')
  }

  discardCurrentGraph(){
    this.metrics.track('discard_current_graph:query')
    if (confirm('Do you want to discard current diagram and load the default example?')){
      this.metrics.track('discard_current_graph:confirmed')
      this.editor.setValue(this.defaultSource)
      this.sourceChanged()
    }
  }

  saveViewModeToStorage(){
    this.metrics.track('view_mode_save:query')
    var question =
      'Do you want to overwrite the diagram in ' +
      'localStorage with the currently viewed diagram?'
    if (confirm(question)){
      this.metrics.track('view_mode_save:confirmed')
      this.filesystem.moveToLocalStorage(this.currentSource())
      window.location.href = './'
    }
  }

  exitViewMode(){
    this.metrics.track('view_mode_exit')
    window.location.href = './'
  }

  handleOpeningFiles(files: FileList) {
    if(files.length !== 1)
      return alert('Only upload a single file.')
    var reader = new FileReader()
    reader.onload = () => this.loadSvg(reader.result as string)
    reader.readAsText(files[0])
  }
}
