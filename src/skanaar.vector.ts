interface Vec { x: number, y: number }

namespace nomnoml.skanaar {
  export var vector = {
    dist: function (a: Vec,b: Vec): number { return vector.mag(vector.diff(a,b)) },
    add: function (a: Vec,b: Vec): Vec { return { x: a.x + b.x, y: a.y + b.y } },
    diff: function (a: Vec,b: Vec): Vec { return { x: a.x - b.x, y: a.y - b.y } },
    mult: function (v: Vec ,factor: number): Vec { return { x: factor*v.x, y: factor*v.y } },
    mag: function (v: Vec ): number { return Math.sqrt(v.x*v.x + v.y*v.y) },
    normalize: function (v: Vec ): Vec { return vector.mult(v, 1/vector.mag(v)) },
    rot: function (a: Vec): Vec { return { x: a.y, y: -a.x } }
  }
}
