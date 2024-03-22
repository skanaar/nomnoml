import * as React from 'react'
import { App } from './App'
import { prevent } from './react-util'

export function SystemBanners(props: { app: App }) {
  var isUrlStorage = props.app.filesystem.storage.kind == 'url'
  var isLocalFileStorage = props.app.filesystem.storage.kind == 'local_file'

  if (isUrlStorage) {
    return (
      <system-banners>
        <banner-card>
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
        </banner-card>
      </system-banners>
    )
  }
  if (isLocalFileStorage) {
    return (
      <system-banners>
        <banner-card>
          Editing "{props.app.filesystem.activeFile.name}"
          <a href="#" title="Exit from this file">
            close
          </a>
        </banner-card>
      </system-banners>
    )
  }

  return <system-banners />
}
