import { DetailedHTMLProps, HTMLAttributes } from 'react'

// this allows us to use custom elements in jsx
// <my-custom-tag class="heavy"></my-custom-tag>
// note that custom elements use "class" instead of "className"
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [key: string]: DetailedHTMLProps<
        HTMLAttributes<HTMLElement> & { class?: string },
        HTMLElement
      >
    }
  }
}

interface CodeMirror {
  fromTextArea(textarea: HTMLTextAreaElement, options: any): CodeMirrorEditor
}

interface CodeMirrorEditor {
  getValue(): string
  setValue(value: string): void
  markText(
    from: { line: number; ch: number },
    to: { line: number; ch: number },
    attr: { css: string }
  ): { clear(): void }
  on(event: string, callback: (arg?: any, arg2?: any) => void): void
  getWrapperElement(): HTMLElement
}
