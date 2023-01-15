import { App } from "./App"
import { Icon } from "./Icon.comp"
import { a, div, el, h2, prevent } from "./react-util"
import { Route } from "./Route"
import {
  camera_outline,
  download_outline,
  globe_meridians,
  image_outline,
  link_outline
} from "./typicons"

export function ExportMenu({ app }: { app: App }) {
  var downloader = app.downloader
  var sourceCode = app.downloader.source
  return div({ className: "file-menu" },
    h2({}, 'Share diagram'),
    a({ className: 'btn', href: '#view/' + Route.urlEncode(sourceCode), target: '_blank' },
      el(Icon, { shape: link_outline }), 'Shareable link'
    ),  
    a({ className: 'btn', href: 'image.svg?source=' + Route.urlEncode(sourceCode), target: '_blank' },
      el(Icon, { shape: globe_meridians }), 'Server hosted SVG'
    ),
    h2({}, 'Downloads'),
    a({ className: 'btn', href: '/', onClick: prevent(() => downloader.pngDownload()) },
      el(Icon, { shape: camera_outline }), 'PNG image'
    ),
    el('p', {}, 'Downloaded image files will be given the filename in the ', el('tt', {}, '#title'), ' directive'),
    a({ className: 'btn', href: '/', onClick: prevent(() => downloader.svgDownload(app.nomnoml.renderSvg)) },
      el(Icon, { shape: image_outline }), 'SVG with source'
    ),
    el('p', {}, "Downloaded SVG files will have the source code embedded. Open an exported SVG file to load it's nomnoml source."),
    a({ className: 'btn', href: '/', onClick: prevent(() => downloader.srcDownload()) },
      el(Icon, { shape: download_outline }), 'Source code'
    ),
  )
}