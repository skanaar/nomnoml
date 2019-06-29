type StoreKind = 'local_default' | 'local_file' | 'cloud' | 'url'

interface FileEntry {
  name: string
  date: string
  backingStore: StoreKind
}

interface GraphStorage {
  read(): string
  save(src: string): void
  clear(): void
  kind: StoreKind
}

class FileSystem {
  signals: Observable = Observable({})
  on = this.signals.on
  off = this.signals.off
  files(): FileEntry[] {
    return JSON.parse(localStorage['nomnoml.file_index'] || '[]') as FileEntry[]
  }
  setFiles(index: FileEntry[]): void {
    localStorage['nomnoml.file_index'] = JSON.stringify(index)
    this.signals.trigger('updated')
  }
  activeFile: FileEntry
  storage: GraphStorage = new DefaultGraphStore()
  moveToFileStorage(name: string, source: string) {
    var entry = {
      name: name,
      date: (new Date()).toISOString(),
      backingStore: 'local_file' as StoreKind
    }
    var index = this.files()
    index.push(entry)
    localStorage['nomnoml.file_index'] = JSON.stringify(index)
    var fileStore = new LocalFileGraphStore(entry.name)
    fileStore.save(source)
    this.signals.trigger('updated')
  }
  moveToLocalStorage(source: string){
    this.storage = new DefaultGraphStore()
    this.storage.save(source)
  }
  discard(entry: FileEntry): void {
    var fileStore = new LocalFileGraphStore(entry.name)
    fileStore.clear()
    this.setFiles(this.files().filter(e => e.name != entry.name))
    this.signals.trigger('updated')
  }
  configureByRoute(path: string) {
    var route = Route.from(path)
    this.storage = this.routedStorage(route)
    this.activeFile = nomnoml.skanaar.find(this.files(), e => e.name === route.path) || { name: route.path, date: (new Date()).toISOString(), backingStore: 'local_file' }
    this.signals.trigger('updated')
  }
  routedStorage(route: Route): GraphStorage {
    if (route.context === 'view') {
      return new UrlGraphStore(decodeURIComponent(route.path))
    }
    if (route.context === 'file') {
      return new LocalFileGraphStore(route.path)
    }
    return new DefaultGraphStore()
  }
}

abstract class LocalGraphStore implements GraphStorage {
  kind: StoreKind
  constructor(private key: string) {}
  read(): string { return localStorage[this.key] }
  save(source: string): void { localStorage[this.key] = source }
  clear(): void { localStorage.removeItem(this.key) }
}

class LocalFileGraphStore extends LocalGraphStore {
  kind: StoreKind = 'local_file'
  constructor(key: string) { super('nomnoml.files/' + key) }
}

class DefaultGraphStore extends LocalGraphStore {
  kind: StoreKind ='local_default'
  constructor() { super('nomnoml.lastSource') }
}

class UrlGraphStore implements GraphStorage {
  kind: StoreKind = 'url'
  constructor(private source: string) {}
  read(): string { return this.source }
  save(source: string): void { }
  clear(): void {}
}
