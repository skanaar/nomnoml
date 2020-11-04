import { App } from "./App"
import { a, div, prevent, span } from "./react-util"

export function SystemBanners(props: { app: App }) {
  var isUrlStorage = (props.app.filesystem.storage.kind == 'url')
  var isLocalFileStorage = (props.app.filesystem.storage.kind == 'local_file')
  var saveAs = prevent(() => props.app.saveAs())

  if (isUrlStorage) {
    return div({ className: "system-banners" },
      span({ className: "banner card visible" },
        'View mode, changes are not saved.',
        a({ onClick: saveAs, href: "/", title: "Save this diagram to localStorage" }, 'save'),
        a({ href: "#", title: "Discard this diagram" }, 'close'),
      )
    )
  }
  if (isLocalFileStorage) {
    return div({ className: "system-banners" },
      span({ className: "banner card visible" },
        'Editing "'+props.app.filesystem.activeFile.name+'"',
        a({ href: "#", title: "Exit from this file" }, 'close'),
      )
    )
  }

  return div({ className: "system-banners" })
}