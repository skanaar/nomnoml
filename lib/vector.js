function sq(x){ return x*x }
function dist(a,b){ return mag(diff(a,b)) }
function add(a,b){ return { x: a.x + b.x, y: a.y + b.y } }
function diff(a,b){ return { x: a.x - b.x, y: a.y - b.y } }
function mult(v,factor){ return { x: factor*v.x, y: factor*v.y } }
function mag(v){ return Math.sqrt(sq(v.x) + sq(v.y)) }
function normalize(v){ return mult(v, 1/mag(v)) }
function rot(a){ return { x: a.y, y: -a.x } }