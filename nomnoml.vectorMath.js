var nomnoml = nomnoml || {};

(function () {
    'use strict';

    var vm = nomnoml.vectorMath = {
        sq: function (x){ return x*x },
        dist: function (a,b){ return vm.mag(vm.diff(a,b)) },
        add: function (a,b){ return { x: a.x + b.x, y: a.y + b.y } },
        diff: function (a,b){ return { x: a.x - b.x, y: a.y - b.y } },
        mult: function (v,factor){ return { x: factor*v.x, y: factor*v.y } },
        mag: function (v){ return Math.sqrt(vm.sq(v.x) + vm.sq(v.y)) },
        normalize: function (v){ return vm.mult(v, 1/vm.mag(v)) },
        rot: function (a){ return { x: a.y, y: -a.x } }
    };
})();
