import { Observable } from "./Observable"
import { Route } from "./Route"
import { find } from "../src/util"

export interface FileEntry {
  name: string
  date: string
  backingStore: StoreKind
}

export interface GraphStorage {
  read(): string
  save(src: string): void
  clear(): void
  kind: StoreKind
}

export class FileSystem {
  signals: Observable = new Observable()
  activeFile: FileEntry = { name: '', date: '1970-01-01', backingStore: 'url' }
  storage: GraphStore = new StoreDefaultBuffer()

  finishedInsertingFiles() {
    this.signals.trigger('updated')
  }

  async moveToFileStorage(name: string, source: string) {
    var fileStore = new StoreLocal(name)
    fileStore.insert(source)
    this.signals.trigger('updated')
  }

  async moveToLocalStorage(source: string): Promise<void> {
    this.storage = new StoreDefaultBuffer()
    await this.storage.save(source)
  }

  async discard(entry: FileEntry): Promise<void> {
    var fileStore = new StoreLocal(entry.name)
    await fileStore.clear()
    this.signals.trigger('updated')
  }

  async configureByRoute(path: string) {
    var route = Route.from(path)
    this.storage = this.routedStorage(route)
    var index = await this.storage.files()
    this.activeFile = find(index, e => e.name === route.path) || fileEntry(route.path, 'local_file')
    this.signals.trigger('updated')
  }

  routedStorage(route: Route): GraphStore {
    if (route.context === 'view') {
      return new StoreUrl(decodeURIComponent(route.path))
    }
    if (route.context === 'file') {
      return new StoreLocal(route.path)
    }
    return new StoreDefaultBuffer()
  }
}

type StoreKind = 'local_default' | 'local_file' | 'filesystem' | 'url'

function fileEntry(name: string, backingStore: StoreKind): FileEntry {
  return { date: (new Date()).toISOString(), name, backingStore }
}

interface GraphStore {
  files(): Promise<FileEntry[]>
  read(): Promise<string>
  insert(src: string): Promise<void>
  save(src: string): Promise<void>
  clear(): Promise<void>
  kind: StoreKind
}

export class StoreDefaultBuffer implements GraphStore {
  kind: StoreKind = 'local_default'
  storageKey: string = 'nomnoml.lastSource'
  async files(): Promise<FileEntry[]> {
    return JSON.parse(localStorage['nomnoml.file_index'] || '[]') as FileEntry[]
  }
  async read(): Promise<string> { return localStorage[this.storageKey] }
  async insert(source: string): Promise<void> { }
  async save(source: string): Promise<void> {
    localStorage[this.storageKey] = source
  }
  async clear(): Promise<void> { }
}

export class StoreUrl implements GraphStore {
  kind: StoreKind = 'url'
  constructor(private source: string) {}
  async files(): Promise<FileEntry[]> {
    return JSON.parse(localStorage['nomnoml.file_index'] || '[]') as FileEntry[]
  }
  async read(): Promise<string> { return this.source }
  async insert(source: string): Promise<void> { }
  async save(source: string): Promise<void> { return null }
  async clear(): Promise<void> { return null }
}

export class StoreLocal implements GraphStore {
  kind: StoreKind = 'local_file'
  storageKey: string
  constructor(public name: string) {
    this.storageKey = 'nomnoml.files/' + name
  }
  async files(): Promise<FileEntry[]> {
    return JSON.parse(localStorage['nomnoml.file_index'] || '[]') as FileEntry[]
  }
  async read(): Promise<string> {
    return localStorage[this.storageKey]
  }
  async insert(source: string): Promise<void> {
    var entry: FileEntry = fileEntry(this.name, 'local_file')
    var index = await this.files()
    if (!find(index, e => e.name === this.name)) {
      index.push(entry)
      index.sort((a,b) => a.name.localeCompare(b.name))
      localStorage['nomnoml.file_index'] = JSON.stringify(index)
    }
    localStorage[this.storageKey] = source
  }
  async save(source: string): Promise<void> {
    localStorage[this.storageKey] = source
  }
  async clear(): Promise<void> {
    localStorage.removeItem(this.storageKey)
    var files = await this.files()
    var index = files.filter(e => e.name != this.name)
    localStorage['nomnoml.file_index'] = JSON.stringify(index)
  }
}