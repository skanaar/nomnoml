(function (factoryFn) {
  if (typeof define === 'function' && define.amd)
  	define(['lodash'], factoryFn);
  else if (typeof module === 'object' && module.exports)
  	module.exports = factoryFn(require('lodash'));
  else this.nomnoml = factoryFn(_);
})(function (_) {
  var self; // Enable usage outside of the browser (in NodeJS)
  if (typeof self === 'undefined' && typeof window === 'undefined') {
    self = {};
  }
  /*{{body}}*/;
  var dagre; // Enable usage outside of the browser (in NodeJS)
  if (typeof dagre === 'undefined' && typeof window === 'undefined') {
    dagre = self.dagre;
  }
  return nomnoml;
});