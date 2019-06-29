class HoverMarker {
  constructor(className: string, elementToMark: HTMLElement, hoverables: HTMLElement[]) {
    function classToggler(state: boolean){
      return function () {
        if(state) elementToMark.classList.add(className)
        else elementToMark.classList.remove(className)
      }
    }
    for(var element of hoverables) {
      element.addEventListener('mouseenter', classToggler(true))
      element.addEventListener('mouseleave', classToggler(false))
    }
  }
}