function CanvasTools(props: { app: App }) {
  return div({},
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
