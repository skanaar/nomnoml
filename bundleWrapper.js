(function (factoryFn) {
  if (typeof define === 'function' && define.amd)
  	define(['lodash', 'dagre'], factoryFn);
  else if (typeof module === 'object' && module.exports)
  	module.exports = factoryFn(require('lodash'), require('dagre'));
  else this.nomnoml = factoryFn(_, dagre);
})(function (_, dagre) {
  /*{{body}}*/;
  return nomnoml;
});