// @ts-ignore
import JSZip from 'jszip'
// @ts-ignore
import saveAs from 'file-saver'
import { App } from './App'
import { FileEntry, StoreLocal } from './FileSystem'
import { Icon } from './Icon'
import { prevent } from './react-util'
import {
  document_add,
  export_arrow,
  folder,
  home_outline,
  image_outline,
  import_arrow,
  pencil,
  trash,
} from './typicons'
import * as React from 'react'

export function FileMenu(props: { app: App; files: FileEntry[]; isLoaded: boolean }) {
  var filesystem = props.app.filesystem
  var isLocalFile = filesystem.storage.kind === 'local_file'
  var isAtHome = filesystem.storage.kind === 'local_default'
  var entries: Array<{ isDir: boolean; name: string; entry?: FileEntry }> = []
  var currentDir = null
  for (var entry of props.files) {
    var path = entry.name.split('/')
    var name = path.pop()!
    var dir = path.join('/')
    if (currentDir != dir && dir !== '') {
      currentDir = dir
      entries.push({ isDir: true, name: dir })
    }
    entries.push({ isDir: false, name: name, entry })
  }

  function isActive(item: FileEntry): boolean {
    return isLocalFile && filesystem.activeFile.name === item.name
  }

  function itemPath(item: FileEntry) {
    return '#file/' + encodeURIComponent(item.name).replace(/%20/g, '+').replace(/%2F/g, '/')
  }

  function discard(item: FileEntry) {
    if (confirm('Permanently delete "' + item.name + '"')) filesystem.discard(item)
  }

  function loadSvg(e: { target: HTMLInputElement }) {
    var files = e.target.files
    props.app.handleOpeningFiles(files!)
  }

  async function rename(entry: FileEntry) {
    var status = await props.app.saveAs(entry.name)
    if (status == 'success') {
      filesystem.discard(entry)
    }
  }

  async function exportArchive(folder?: string) {
    var zip = new JSZip()
    var files = await filesystem.storage.files()
    for (var file of files) {
      if (!folder || file.name.startsWith(folder + '/')) {
        var store = new StoreLocal(file.name)
        zip.file(file.name, await store.read())
      }
    }
    var blob = await zip.generateAsync({ type: 'blob' })
    var date = new Date().toISOString().substr(0, 10)
    saveAs(blob, folder ?? `nomnoml-${date}.zip`)
  }

  async function importArchive(e: { target: HTMLInputElement }) {
    var fileInputElement = e.target
    var file = fileInputElement.files![0]
    var archiveName = file.name.replace(/\.zip$/, '')
    var folder = prompt(
      'Specify folder name to import files into.\nLeave empty to load into root.',
      archiveName
    )
    if (folder == null) {
      return
    }
    folder = folder.trim() ? folder.replace(/\/$/, '') + '/' : ''
    var files = await filesystem.storage.files()
    var zip = await JSZip.loadAsync(file)
    for (var key in zip.files) {
      if (key.split('/').some((segment) => segment[0] == '.')) continue // skip hidden files and folders
      var zipEntry = zip.file(key)
      if (!zipEntry) continue // skip directories
      var content = await zipEntry.async('text')
      var filename = uniqueName(
        folder + key,
        files.map((e) => e.name)
      )
      var fileStore = new StoreLocal(filename)
      await fileStore.insert(content)
    }
    fileInputElement.value = ''
    filesystem.finishedInsertingFiles()
  }

  function uniqueName(name: string, existing: string[]): string {
    var suffix: number | '' = ''
    while (existing.some((e) => e == name + suffix)) {
      suffix = suffix == '' ? 2 : suffix + 1
    }
    return name + suffix.toString()
  }

  function makeFileEntry(name: string, entry: FileEntry) {
    var activeness = isActive(entry) ? 'active ' : ''
    var indention = name === entry.name ? '' : 'indented'
    return (
      <div key={entry.name} className={'file-entry ' + activeness + indention}>
        <a href={itemPath(entry)}>{name}</a>
        {isActive(entry) && (
          <a onClick={prevent(() => rename(entry))} title="Rename this diagram">
            <Icon shape={pencil} />
          </a>
        )}
        <a onClick={prevent(() => discard(entry))} title="Discard this diagram">
          <Icon shape={trash} />
        </a>
      </div>
    )
  }

  function makeDirEntry(name: string) {
    return (
      <div key={'//dir/' + name} className="file-entry directory">
        <a href="javascript:void(0)">
          <Icon shape={folder} />
          {name}
        </a>
        <a onClick={prevent(() => exportArchive(name))} title="Export folder as archive">
          <Icon shape={export_arrow} />
        </a>
      </div>
    )
  }

  return (
    <div className="file-menu">
      <label className="btn">
        <Icon shape={image_outline} />
        Open SVG with source...
        <input type="file" accept="image/svg+xml" onChange={prevent((e) => loadSvg(e))} />
      </label>

      <a className="btn" href="/" onClick={prevent(() => exportArchive())}>
        <Icon shape={export_arrow} />
        Export .zip archive...
      </a>

      <label className="btn">
        <Icon shape={import_arrow} />
        Import .zip archive...
        <input type="file" accept="application/zip" onChange={prevent((e) => importArchive(e))} />
      </label>

      <a className="btn" href="/" onClick={prevent(() => props.app.saveAs())}>
        <Icon shape={document_add} />
        Save to local file...
      </a>

      <h2>{props.isLoaded ? 'Local files' : 'loading files...'}</h2>

      <div className={'file-entry ' + (isAtHome ? 'active' : '')}>
        <a href="#">
          <Icon shape={home_outline} /> Home
        </a>
      </div>

      {entries.map((e) => (e.isDir ? makeDirEntry(e.name) : makeFileEntry(e.name, e.entry!)))}

      <h2>{' '}</h2>

      <p>
        Import files with <code>#import: file</code>
      </p>

      <p>
        Create folders with <code>/</code> in filename
      </p>
    </div>
  )
}
