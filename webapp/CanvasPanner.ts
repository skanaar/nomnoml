class CanvasPanner {
  
  offset: Vec = {x:0, y:0}

  zoomLevel: number = 0

  constructor(element: HTMLElement, private onChange: () => void, throttle: Throttler) {
    var mouseDownPoint: Vec | boolean = false
    function isVec(value: Vec | boolean): value is Vec { return value != false }

    var mouseMove = (e: MouseEvent) => {
      if (isVec(mouseDownPoint)){
        this.offset = nomnoml.skanaar.vector.diff({ x: e.pageX, y: e.pageY }, mouseDownPoint)
        onChange()
      }
    }

    var mouseUp = () => {
      mouseDownPoint = false
      element.style.width = '33%'
    }

    var magnify = (e: MouseWheelEvent) => {
      this.zoomLevel = Math.min(10, this.zoomLevel - (e.deltaY < 0 ? -1 : 1))
      onChange()
    }

    var mouseDown = (e: MouseEvent) => {
      element.style.width = '100%'
      mouseDownPoint = nomnoml.skanaar.vector.diff({ x: e.pageX, y: e.pageY }, this.offset)
    }

    element.addEventListener('mousedown', mouseDown)
    element.addEventListener('mouseup', mouseUp)
    element.addEventListener('mouseleave', mouseUp)
    element.addEventListener('wheel', throttle(magnify, 50), {passive: true})
    element.addEventListener('mousemove', throttle(mouseMove, 50), {passive: true})
  }

  positionCanvas(element: HTMLCanvasElement) {
    var viewport = window
    var w = element.width / this.superSampling
    var h = element.height / this.superSampling
    element.style.top = 300 * (1 - h/viewport.innerHeight) + this.offset.y + 'px'
    element.style.left = 150 + (viewport.innerWidth - w)/2 + this.offset.x + 'px'
    element.style.width = w + 'px'
    element.style.height = h + 'px'
  }

  superSampling = window.devicePixelRatio || 1

  zoom(): number {
    return this.superSampling * Math.exp(this.zoomLevel/10)
  }

  magnify(diff: number) {
    this.zoomLevel = Math.min(10, this.zoomLevel + diff)
    this.onChange()
  }

  reset() {
    this.zoomLevel = 1
    this.offset = {x: 0, y: 0}
    this.onChange()
  }
}