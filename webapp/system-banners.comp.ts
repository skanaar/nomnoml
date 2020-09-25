function SystemBanners(props: { app: App }) {
  var isUrlStorage = (props.app.filesystem.storage.kind == 'url')
  var isLocalFileStorage = (props.app.filesystem.storage.kind == 'local_file')

  return div({ className: "system-banners" },
    span({ className: "banner card " + (isUrlStorage ? 'visible' : '') },
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
    
    isLocalFileStorage ? el('br') : null,
    
    span({ className: "banner card " + (isLocalFileStorage ? 'visible' : '') },
      'Editing local file',
      a({
        href: "#",
        title: "Exit from this file"
      }, 'close'),
    )
  )
}