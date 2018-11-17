var skanaar = skanaar || {};
skanaar.vector = {
    dist: function (a,b){ return skanaar.vector.mag(skanaar.vector.diff(a,b)) },
    add: function (a,b){ return { x: a.x + b.x, y: a.y + b.y } },
    diff: function (a,b){ return { x: a.x - b.x, y: a.y - b.y } },
    mult: function (v,factor){ return { x: factor*v.x, y: factor*v.y } },
    mag: function (v){ return Math.sqrt(v.x*v.x + v.y*v.y) },
    normalize: function (v){ return skanaar.vector.mult(v, 1/skanaar.vector.mag(v)) },
    rot: function (a){ return { x: a.y, y: -a.x } }
};
