function FileMenu(props: { app: App }) {
    
  var filesystem = props.app.filesystem
  var items = filesystem.files()
  var isLocalFile = filesystem.storage.kind === 'local_file'
  var isAtHome = filesystem.storage.kind === 'local_default'

  function isActive(item: FileEntry): boolean {
    return isLocalFile && filesystem.activeFile.name === item.name
  }

  function itemPath(item: FileEntry) {
    return '#file/' + encodeURIComponent(item.name).replace(/%20/g, '+')
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
    
  return div({ className: "file-menu" },

    label({ className: "btn" },
        el(Icon, { id: 'image-outline' }), 'Open SVG with source...',
        input({ type: "file", accept: "image/svg+xml", onChange: prevent(loadSvg) })
    ),

    a({ className: "btn", href: "/", onClick: prevent(() => saveAs()) },
        el(Icon, { id: 'document-add' }), 'Save to local file...',
    ),    

    hr(),

    h2({}, 'Local files'),

    div({ className: 'file-entry ' + (isAtHome ? 'active' : '') },
        a({ href: "#" }, el(Icon, { id: 'home-outline' }), 'Home'),
    ),

    items.map(item => div({ key: item.name, className: 'file-entry ' + (isActive(item) ? 'active' : '') },
        a({ href: itemPath(item) }, item.name),
        a({ onClick: prevent(() =>discard(item)), title: "Discard this diagram" },
            el(Icon, { id: 'trash' })
        )
    ))
  )
}
