function delay(func: Function, wait: number, ...args: any[]) {
  return setTimeout(function() {
    return func.apply(null, args);
  }, wait);
}

export function unescapeHtml(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x60;/g, '`')
}

export function throttle(func: Function, wait: number, options: { leading?: boolean, trailing?: boolean } = {}) {
  var timeout: NodeJS.Timeout|null;
  var context: any;
  var args: IArguments|null;
  var result: any;
  var previous = 0;

  var later = function() {
    previous = options.leading === false ? 0 : Date.now();
    timeout = null;
    result = func.apply(context, args);
    if (!timeout) context = args = null;
  };

  return function() {
    var _now = Date.now();
    if (!previous && options.leading === false) previous = _now;
    var remaining = wait - (_now - previous);
    context = this;
    args = arguments;
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = _now;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining);
    }
    return result;
  };
}

export function debounce(func: Function, wait: number, immediate: boolean = false) {
  var timeout: any;
  var result: any;

  function later(context: any, args: any[]) {
    timeout = null;
    if (args) result = func.apply(context, args);
  }

  return function(...args: any[]) {
    if (timeout) clearTimeout(timeout);
    if (immediate) {
      var callNow = !timeout;
      timeout = setTimeout(later, wait);
      if (callNow) result = func.apply(this, args);
    } else {
      timeout = delay(later, wait, this, args);
    }

    return result;
  }
}
