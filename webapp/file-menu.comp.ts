import { App } from "./App"
import { FileEntry } from "./FileSystem"
import { Icon } from "./Icon.comp"
import { a, div, el, h2, input, label, prevent } from "./react-util"
import { document_add, folder, home_outline, image_outline, pencil, trash } from "./typicons"

export function FileMenu(props: { app: App, files: FileEntry[], isLoaded: boolean }) {
  var filesystem = props.app.filesystem
  var isLocalFile = filesystem.storage.kind === 'local_file'
  var isAtHome = filesystem.storage.kind === 'local_default'
  var entries: Array<{ isDir: boolean, name: string, entry: FileEntry }> = []
  var currentDir = null
  for(var entry of props.files) {
    var path = entry.name.split('/')
    var name = path.pop()
    var dir = path.join('/')
    if (currentDir != dir && dir !== '') {
      currentDir = dir
      entries.push({ isDir: true, name: dir, entry: null })
    }
    entries.push({ isDir: false, name, entry })
  }

  function isActive(item: FileEntry): boolean {
    return isLocalFile && filesystem.activeFile.name === item.name
  }

  function itemPath(item: FileEntry) {
    return '#file/' + encodeURIComponent(item.name).replace(/%20/g, '+').replace(/%2F/g, '/')
  }

  function discard(item: FileEntry) {
    if (confirm('Permanently delete "' + item.name + '"'))
      filesystem.discard(item)
  }

  function loadSvg(e: Event) {
    var files = (e.target as HTMLInputElement).files
    props.app.handleOpeningFiles(files)
  }
  
  async function rename(entry: FileEntry) {
    var status = await props.app.saveAs(entry.name)
    if (status == 'success') {
      filesystem.discard(entry)
    }
  }
  
  function makeFileEntry(name: string, entry: FileEntry) {
    var activeness = isActive(entry) ? 'active ' : ''
    var indention = (name === entry.name) ? '' : 'indented'
    return div(
      { key: entry.name, className: 'file-entry ' + activeness + indention },
      a({ href: itemPath(entry) }, name),
      isActive(entry) && a({ onClick: prevent(() =>rename(entry)), title: "Rename this diagram" },
          el(Icon, { shape: pencil })
      ),
      a({ onClick: prevent(() =>discard(entry)), title: "Discard this diagram" },
          el(Icon, { shape: trash })
      )
    )
  }
  
  function makeDirEntry(name: string) {
    return div({ key: '//dir/'+name, className: 'file-entry directory' },
      a({ href: 'javascript:void(0)' }, el(Icon, { shape: folder }), name)
    )
  }
    
  return div({ className: "file-menu" },

    label({ className: "btn" },
        el(Icon, { shape: image_outline }), 'Open SVG with source...',
        input({ type: "file", accept: "image/svg+xml", onChange: prevent(loadSvg) })
    ),

    a({ className: "btn", href: "/", onClick: prevent(() => props.app.saveAs()) },
        el(Icon, { shape: document_add }), 'Save to local file...',
    ),

    h2({}, props.isLoaded ? 'Local files' : 'loading files...'),

    div({ className: 'file-entry ' + (isAtHome ? 'active' : '') },
        a({ href: "#" }, el(Icon, { shape: home_outline }), 'Home'),
    ),

    entries.map(e => (e.isDir ? makeDirEntry(e.name) : makeFileEntry(e.name, e.entry))),
    
    h2({}, ' '),
    
    el('p', {}, 'Import files with ', el('code', {}, '#import: file')),
    
    el('p', {}, 'Create folders with ', el('code', {}, '/'),' in filename')
  )
}
