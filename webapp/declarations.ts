export interface CodeMirror {
  fromTextArea(textarea: HTMLTextAreaElement, options: any): CodeMirrorEditor
}

export interface CodeMirrorEditor {
  getValue(): string
  setValue(value: string): void
  markText(
    from: { line: number; ch: number },
    to: { line: number; ch: number },
    attr: { css: string },
  ): { clear(): void }
  on(event: string, callback: (arg?: any, arg2?: any) => void): void
  getWrapperElement(): HTMLElement
}
