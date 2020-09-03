function StorageTools(props: { app: App }) {

  var isUrlStorage = (props.app.filesystem.storage.kind == 'url')
  var isLocalFileStorage = (props.app.filesystem.storage.kind == 'local_file')

  return div({ className: "storage-tools" },
    span({ className: "storage-status " + (isUrlStorage ? 'visible' : '') },
      'View mode, changes are not saved.',
      a({
        onClick: prevent(() => props.app.saveViewModeToStorage()),
        href: "/",
        title: "Save this diagram to localStorage"
      }, 'save'),
      a({
        href: "#",
        title: "Discard this diagram"
      }, 'close'),
    ),
    
    span({ className: "storage-status " + (isLocalFileStorage ? 'visible' : '') },
      'Editing local file',
      a({
        href: "#",
        title: "Exit from this file"
      }, 'close'),
    )
  )
}