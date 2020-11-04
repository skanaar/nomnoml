import { App } from "./App";
import { Icon } from "./Icon.comp";
import { a, div, el, prevent } from "./react-util"

export function CanvasTools(props: { app: App }) {
  return div({ className: 'canvas-tools' },
    div({ className: 'canvas-button' },
      a({ title: 'Zoom in', onClick: prevent(() => props.app.magnifyViewport(2))}, el(Icon, { id: 'plus' }))
    ),
    div({ className: 'canvas-button' },
      a({ title: 'Reset zoom and panning', onClick: prevent(() => props.app.resetViewport())}, el(Icon, { id: 'equals' }))
    ),
    div({ className: 'canvas-button' },
      a({ title: 'Zoom out', onClick: prevent(() => props.app.magnifyViewport(-2))}, el(Icon, { id: 'minus' }))
    )
  )
}
