function ExportMenu(props: { app: App }) {
  var downloader = props.app.downloader
  var sourceCode = props.app.downloader.source
  return div({ className: "file-menu" },
    a({ className: 'btn', href: '#view/' + Route.urlEncode(sourceCode), target: '_blank' },
      el(Icon, { id: 'link-outline' }), 'Open shareable link'
    ),
    a({ className: 'btn', href: '/', onClick: prevent(() => downloader.pngDownload()) },
      el(Icon, { id: 'camera-outline' }), 'Download PNG'
    ),
    a({ className: 'btn', href: '/', onClick: prevent(() => downloader.svgDownload()) },
      el(Icon, { id: 'image-outline' }), 'Download SVG with source'
    ),
    a({ className: 'btn', href: '/', onClick: prevent(() => downloader.srcDownload()) },
      el(Icon, { id: 'download-outline' }), 'Download source'
    ),
  )
}