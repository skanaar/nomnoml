interface CodeMirror {
  fromTextArea(textarea: HTMLTextAreaElement, options: any): CodeMirrorEditor
}

interface CodeMirrorEditor {
  getValue(): string
  setValue(value: string): void
  on(event: string, callback: (arg?: any, arg2?: any) => void): void
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

interface Underscore {
  throttle: Throttler
  debounce: Throttler
  unescape(input: string): string
}

declare class Vue {
    constructor(config: any)
    static component(name: string, config: any): any
}
