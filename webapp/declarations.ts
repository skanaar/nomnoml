interface CodeMirror {
  fromTextArea(textarea: HTMLTextAreaElement, options: any): CodeMirrorEditor
}

interface CodeMirrorEditor {
  getValue(): string
  setValue(value: string): void
  on(event: string, callback: (arg?: any, arg2?: any) => void): void
  getWrapperElement(): HTMLElement
}

declare module "react-dom" {
  export function render(comp: any, element: Element): void
}

declare module "react" {
  export function createElement<T>(comp: (props: T) => any, props: T, ...args: any[]): any
  export function createElement<T>(comp: string, ...args: any[]): any
  export function useState<T>(initial: T): [T, (x:T)=>void]
  export function useEffect(fn: Function): void
}
