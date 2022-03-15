import { useState, useEffect } from "react"
import { App } from "./App"
import { div, el, span } from "./react-util"

export function TerminalBanners(props: { app: App }) {

  var [error, setError] = useState<{ title: string, details: string}|null>(null)
  function onError(err: Error) {
      setError(err ? { title: 'Compile error', details: err.message } : null)
  }
  useEffect(() => {
      props.app.signals.on('compile-error', onError)
      return () => props.app.signals.off('compile-error', onError)
  })

  return div({ className: "terminal-banners" },
    error && span({ className: "banner card card-warning visible" },
      error.title,
      el('br'),
      el('tt', {}, error.details)
    ),
  )
}