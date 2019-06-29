class Tooltips {
  constructor(tooltip: HTMLElement, links: NodeListOf<HTMLAnchorElement>) {
    for (var i=0; i<links.length; i++) {
      attach(links[i])
    }

    function attach(link: HTMLAnchorElement) {
      link.onmouseover = function (){ tooltip.textContent = link.getAttribute('title') }
      link.onmouseout = function (){ tooltip.textContent = '' }
    }
  }
}