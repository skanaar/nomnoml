function FileMenu(props: { app: App }) {
    
  var filesystem = props.app.filesystem
  var items = filesystem.files()
  var isLocalFile = filesystem.storage.kind === 'local_file'
  var isAtHome = filesystem.storage.kind === 'local_default'
  var entries: Array<{ isDir: boolean, name: string, entry: FileEntry }> = []
  var currentDir = null
  for(var entry of items) {
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

  function saveAs() {
    var name = prompt('Name your diagram')
    if (name) {
      if (filesystem.files().some((e: FileEntry) => e.name === name)) {
        alert('A file named '+name+' already exists.')
        return
      }
      filesystem.moveToFileStorage(name, props.app.currentSource())
      location.href = '#file/' + encodeURIComponent(name)
    }
  }

  function loadSvg(e: Event) {
    var files = (e.target as HTMLInputElement).files
    props.app.handleOpeningFiles(files)
  }
  
  function makeFileEntry(name: string, entry: FileEntry) {
    var activeness = isActive(entry) ? 'active ' : ''
    var indention = (name === entry.name) ? '' : 'indented'
    return div({ key: entry.name, className: 'file-entry ' + activeness + indention },
      a({ href: itemPath(entry) }, name),
      a({ onClick: prevent(() =>discard(entry)), title: "Discard this diagram" },
          el(Icon, { id: 'trash' })
      )
    )
  }
  
  function makeDirEntry(name: string) {
    return div({ key: '//dir/'+name, className: 'file-entry directory' },
      a({ href: 'javascript:void(0)' }, el(Icon, { id: 'folder' }), name)
    )
  }
    
  return div({ className: "file-menu" },

    label({ className: "btn" },
        el(Icon, { id: 'image-outline' }), 'Open SVG with source...',
        input({ type: "file", accept: "image/svg+xml", onChange: prevent(loadSvg) })
    ),

    a({ className: "btn", href: "/", onClick: prevent(() => saveAs()) },
        el(Icon, { id: 'document-add' }), 'Save to local file...',
    ),
    
    el('p', {}, 'Import files with the #import directive', el('br', {}), el('code', {}, '#import: filename')),
    
    el('p', {}, 'Use ', el('code', {}, '/'),' in your file names to specify folders.'),

    h2({}, 'Local files'),

    div({ className: 'file-entry ' + (isAtHome ? 'active' : '') },
        a({ href: "#" }, el(Icon, { id: 'home-outline' }), 'Home'),
    ),

    entries.map(e => (e.isDir ? makeDirEntry(e.name) : makeFileEntry(e.name, e.entry)))
  )
}
