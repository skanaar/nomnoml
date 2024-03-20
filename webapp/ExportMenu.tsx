import * as React from 'react'
import { App } from './App'
import { Icon } from './Icon'
import { prevent } from './react-util'
import { Route } from './Route'
import {
  camera_outline,
  download_outline,
  globe_meridians,
  image_outline,
  link_outline,
} from './typicons'

export function ExportMenu({ app }: { app: App }) {
  var downloader = app.downloader
  var sourceCode = app.downloader.source
  return (
    <div className="file-menu">
      <h2>Share diagram</h2>
      <a className="btn" href={'#view/' + Route.urlEncode(sourceCode)} target="_blank">
        <Icon shape={link_outline} />
        Shareable link
      </a>
      <a className="btn" href={'image.svg?source=' + Route.urlEncode(sourceCode)} target="_blank">
        <Icon shape={globe_meridians} />
        Server hosted SVG
      </a>
      <h2>Downloads</h2>
      <a className="btn" href="/" onClick={prevent(() => downloader.pngDownload())}>
        <Icon shape={camera_outline} />
        PNG image
      </a>
      <p>
        Downloaded image files will be given the filename in the <code>#title</code> directive
      </p>
      <a
        className="btn"
        href="/"
        onClick={prevent(() => downloader.svgDownload(app.nomnoml.renderSvg))}
      >
        <Icon shape={image_outline} />
        SVG with source
      </a>
      <p>
        Downloaded SVG files will have the source code embedded. Open an exported SVG file to load
        it's nomnoml source.
      </p>
      <a className="btn" href="/" onClick={prevent(() => downloader.srcDownload())}>
        <Icon shape={download_outline} />
        Source code
      </a>
    </div>
  )
}
