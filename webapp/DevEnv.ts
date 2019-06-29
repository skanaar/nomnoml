class DevEnv {
  constructor(
    private editor: HTMLElement,
    private marker: HTMLElement,
    private lineNumbers: HTMLElement
  ) {}
  clearState() {
    this.marker.style.top = '-30px'
    this.lineNumbers.classList.remove('error')
  }
  setError(error: Error) {
    this.lineNumbers.classList.add('error')
    var matches = error.message.match('line ([0-9]*)')
    if (matches){
      var lineHeightValue = window.getComputedStyle(this.editor).lineHeight
      var lineHeight = parseFloat(lineHeightValue) || 12
      this.marker.style.top = 3 + lineHeight * +matches[1] + 'px'
    }
    else {
      throw error
    }
  }
}
