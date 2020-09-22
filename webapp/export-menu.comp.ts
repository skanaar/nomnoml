function ExportMenu(props: { app: App }) {
  var downloader = props.app.downloader
  var sourceCode = props.app.downloader.source
  return div({ className: "file-menu" },
    h2({}, 'Share diagram'),
    a({ className: 'btn', href: '#view/' + Route.urlEncode(sourceCode), target: '_blank' },
      el(Icon, { id: 'link-outline' }), 'Shareable link'
    ),  
    a({ className: 'btn', href: 'image.svg?source=' + Route.urlEncode(sourceCode), target: '_blank' },
      el(Icon, { id: 'globe' }), 'Server hosted SVG'
    ),
    h2({}, 'Downloads'),
    a({ className: 'btn', href: '/', onClick: prevent(() => downloader.pngDownload()) },
      el(Icon, { id: 'camera-outline' }), 'PNG image'
    ),
    a({ className: 'btn', href: '/', onClick: prevent(() => downloader.svgDownload()) },
      el(Icon, { id: 'image-outline' }), 'SVG with source'
    ),
    a({ className: 'btn', href: '/', onClick: prevent(() => downloader.srcDownload()) },
      el(Icon, { id: 'download-outline' }), 'Source code'
    ),
  )
}