(function (factoryFn) {
  if (typeof module === 'object' && module.exports)
  	module.exports = factoryFn(require('lodash'), require('dagre'));
  else this.nomnoml = factoryFn(_, dagre);
})(function (_, dagre) {
  /*{{body}}*/;
  return nomnoml;
});