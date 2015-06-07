(function (factoryFn) {
  if (typeof define === 'function' && define.amd)
  	define(['lodash'], factoryFn);
  else if (typeof module === 'object' && module.exports)
  	module.exports = factoryFn(require('lodash'));
  else this.nomnoml = factoryFn(_);
})(function (_) {
  /*{{body}}*/;
  return nomnoml;
});