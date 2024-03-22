import * as React from 'react'
import { useState, useEffect } from 'react'
import { App } from './App'

export function TerminalBanners(props: { app: App }) {
  var [error, setError] = useState<{ title: string; details: string } | null>(null)
  function onError(err: Error) {
    setError(err ? { title: 'Parse error', details: err.message } : null)
  }
  useEffect(() => {
    props.app.signals.on('compile-error', onError)
    return () => props.app.signals.off('compile-error', onError)
  })

  if (!error) return <terminal-banners />

  return (
    <terminal-banners>
      <banner-card data-warning>
        {error.title}
        <br />
        <code>{error.details}</code>
      </banner-card>
    </terminal-banners>
  )
}
