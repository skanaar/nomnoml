function TerminalBanners(props: { app: App }) {

  var [error, setError] = React.useState(null)
  function onError(err: Error) {
      setError(err ? { title: 'Compile error', details: err.message } : null)
  }
  React.useEffect(function () {
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