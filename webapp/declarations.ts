interface CodeMirror {
  fromTextArea(textarea: HTMLTextAreaElement, options: any): CodeMirrorEditor
}

interface CodeMirrorEditor {
  getValue(): string
  setValue(value: string): void
  on(event: string, callback: (arg?: any) => void): void
  getWrapperElement(): HTMLElement
}

interface Metrics {
  track(event: string, payload?: any): void
}

interface Nomnoml {
  draw(canvasElement: HTMLCanvasElement, renderedText: string, zoom: number): {
    config: {
      title: string
    }
  }
}

type Throttler = (func: (arg: any) => void, timespan: number, opts?: any) => (arg: any) => void

declare class Vue {
    constructor(config: any)
    static component(name: string, config: any): any
}

// These custom declarations for Map and Set match IE 11's API

declare class Map<TKey, TValue> {
  has(key: TKey): boolean
  get(key: TKey): TValue | undefined
  set(key: TKey, value: TValue): void
  delete(key: TKey): void
}

declare class Set<T> {
  size: number
  add(item: T): void
  delete(item: T): void
  forEach(action: Function): void
}