(function (factoryFn) {
  if (typeof define === 'function' && define.amd)
  	define(['lodash'], factoryFn);
  else if (typeof module === 'object' && module.exports)
  	module.exports = factoryFn(require('lodash'));
  else this.nomnoml = factoryFn(_);
})(function (_) {
  var self; // Enable usage with require.js and outside of the browser
  if (typeof self === 'undefined') {
    self = {};
  }
  /*{{body}}*/;
  var dagre; // Enable usage with require.js and outside of the browser
  if (typeof dagre === 'undefined') {
    dagre = self.dagre;
  }
  return nomnoml;
});