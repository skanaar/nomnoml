import * as ReactDOM from "react-dom"
import { App } from "./App"
import { CanvasTools } from "./canvas-tools.comp"
import { ExportMenu } from "./export-menu.comp"
import { FileMenu } from "./file-menu.comp"
import { Menu } from "./Menu"
import { el } from "./react-util"
import { unescapeHtml } from "./util"
// @ts-ignore
import * as nomnoml from "../dist/nomnoml.js"

// @ts-ignore
export * as nomnoml from "../dist/nomnoml.js"
export { DailyTip, NomnomlGraph } from './daily-tip.comp'
export { App } from "./App"

export var app: App;

// @ts-ignore
export { version } from "../package.json";

export function bootstrap(CodeMirror: CodeMirror) {
  app = new App(CodeMirror)
  var elem = (query: string) => document.querySelector(query)
  render()
  renderFileMenu()

  function render() {
    ReactDOM.render(el(ExportMenu, { app }), elem('[export-menu]'))
    ReactDOM.render(el(Menu, { app }), elem('[menu]'))
    ReactDOM.render(el(CanvasTools, { app }), elem('[canvas-tools]'))
  }
  
  function renderFileMenu() {
    ReactDOM.render(el(FileMenu, { app, files: [], isLoaded: false }), elem('[file-menu]'))
    app.filesystem.storage.files().then(files => {
      ReactDOM.render(el(FileMenu, { app, files, isLoaded: true }), elem('[file-menu]'))
    })
  }

  app.signals.on('source-changed', render)
  app.signals.on('compile-error', render)
  app.filesystem.signals.on('updated', renderFileMenu)

  function renderPreviews() {
    var files: Record<string, string> = {}
    var includes = document.querySelectorAll('[publish-as-file]')
    for(var i=0; i<includes.length; i++) {
      var name = includes[i].attributes.getNamedItem('publish-as-file').value
      files[name] = unescapeHtml(includes[i].innerHTML)
    }

    var sources = document.querySelectorAll('[append-nomnoml-preview]')
    for(var i=0; i<sources.length; i++) {
      try {
        var srcEl = sources[i]
        var src = nomnoml.processImports(unescapeHtml(srcEl.innerHTML), (key: string) => files[key])
        var svg = nomnoml.renderSvg(src, document)
        var div = document.createElement('div')
        div.innerHTML = svg
        srcEl.append(div)
      } catch(e) {}
    }
  }

  renderPreviews()
}
