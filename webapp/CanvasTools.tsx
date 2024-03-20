import * as React from 'react'
import { App } from './App'
import { Icon } from './Icon'
import { prevent } from './react-util'
import { equals, minus, plus } from './typicons'

export function CanvasTools({ app }: { app: App }) {
  return (
    <canvas-tools>
      <a title="Zoom in" onClick={prevent(() => app.magnifyViewport(2))}>
        <Icon shape={plus} />
      </a>

      <a title="Reset zoom and panning" onClick={prevent(() => app.resetViewport())}>
        <Icon shape={equals} />
      </a>

      <a title="Zoom out" onClick={prevent(() => app.magnifyViewport(-2))}>
        <Icon shape={minus} />
      </a>
    </canvas-tools>
  )
}
