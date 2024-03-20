import * as React from 'react'
import { useState } from 'react'
import { App } from './App'
import { Icon } from './Icon'
import { prevent } from './react-util'
import { SystemBanners } from './SystemBanners'
import { TerminalBanners } from './TerminalBanners'
import {
  arrow_down_outline,
  document_text,
  folder_open,
  info_large_outline,
  trash,
} from './typicons'

export function Menu({ app }: { app: App }) {
  var [hint, setHint] = useState('')

  return (
    <div className="tools">
      <a
        className="logo"
        onClick={prevent(() => app.toggleSidebar('about'))}
        onMouseLeave={() => setHint('')}
        onMouseEnter={() => setHint('About nomnoml')}
      >
        <h1>nomnoml</h1>
      </a>
      <a
        onClick={prevent(() => app.toggleSidebar('about'))}
        onMouseLeave={() => setHint('')}
        onMouseEnter={() => setHint('About nomnoml')}
      >
        <Icon shape={info_large_outline} />
      </a>
      <a
        onClick={prevent(() => app.toggleSidebar('reference'))}
        onMouseLeave={() => setHint('')}
        onMouseEnter={() => setHint('Language reference')}
      >
        <Icon shape={document_text} />
      </a>
      <a
        onClick={prevent(() => app.toggleSidebar('export'))}
        onMouseLeave={() => setHint('')}
        onMouseEnter={() => setHint('Export this diagram')}
      >
        <Icon shape={arrow_down_outline} />
      </a>
      <a
        onClick={prevent(() => app.toggleSidebar('files'))}
        onMouseLeave={() => setHint('')}
        onMouseEnter={() => setHint('Save this or load another diagram')}
      >
        <Icon shape={folder_open} />
      </a>

      {app.dynamicButton ? (
        app.dynamicButton(app, setHint)
      ) : (
        <a
          onClick={prevent(() => app.discardCurrentGraph())}
          onMouseLeave={() => setHint('')}
          onMouseEnter={() => setHint('Discard current diagram')}
        >
          <Icon shape={trash} />
        </a>
      )}
      <div id="tooltip">{hint}</div>
      <SystemBanners app={app} />
      <TerminalBanners app={app} />
    </div>
  )
}
