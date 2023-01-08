export class DevEnv {
  constructor(
    private editor: HTMLElement,
    private marker: HTMLElement,
    private lineNumbers: HTMLElement
  ) {}
  clearState() {
    this.marker.style.top = '-30px'
    this.lineNumbers.classList.remove('error')
  }
  setError(start: { column: number; line: number }) {
    this.lineNumbers.classList.add('error')
    var lineHeightValue = window.getComputedStyle(this.editor).lineHeight
    var lineHeight = parseFloat(lineHeightValue) || 12
    this.marker.style.top = 3 + lineHeight * start.line + 'px'
  }
}
