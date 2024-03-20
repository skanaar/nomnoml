import * as React from 'react'
import { App } from './App'
import { prevent } from './react-util'

export function SystemBanners(props: { app: App }) {
  var isUrlStorage = props.app.filesystem.storage.kind == 'url'
  var isLocalFileStorage = props.app.filesystem.storage.kind == 'local_file'

  if (isUrlStorage) {
    return (
      <div className="system-banners">
        <span className="banner card visible">
          View mode, changes are not saved.
          <a
            onClick={prevent(() => props.app.saveAs())}
            href="/"
            title="Save this diagram to localStorage"
          >
            save
          </a>
          <a href="#" title="Discard this diagram">
            close
          </a>
        </span>
      </div>
    )
  }
  if (isLocalFileStorage) {
    return (
      <div className="system-banners">
        <span className="banner card visible">
          Editing "{props.app.filesystem.activeFile.name}"
          <a href="#" title="Exit from this file">
            close
          </a>
        </span>
      </div>
    )
  }

  return <div className="system-banners" />
}
