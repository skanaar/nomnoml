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
  (function a(b,c,d){function e(g,h){if(!c[g]){if(!b[g]){var j=typeof require=="function"&&require;if(!h&&j)return j(g,!0);if(f)return f(g,!0);throw new Error("Cannot find module '"+g+"'")}var k=c[g]={exports:{}};b[g][0].call(k.exports,function(a){var c=b[g][1][a];return e(c?c:a)},k,k.exports,a,b,c,d)}return c[g].exports}var f=typeof require=="function"&&require;for(var g=0;g<d.length;g++)e(d[g]);return e})({1:[function(a,b,c){var d=typeof self!="undefined"?self:typeof window!="undefined"?window:{};d.dagre=a("./index")},{"./index":2}],2:[function(a,b,c){c.Digraph=a("graphlib").Digraph,c.Graph=a("graphlib").Graph,c.layout=a("./lib/layout"),c.version=a("./lib/version")},{"./lib/layout":3,"./lib/version":18,graphlib:24}],3:[function(a,b,c){var d=a("./util"),e=a("./rank"),f=a("./order"),g=a("graphlib").CGraph,h=a("graphlib").CDigraph;b.exports=function(){function j(a){var c=new h;a.eachNode(function(a,b){b===undefined&&(b={}),c.addNode(a,{width:b.width,height:b.height}),b.hasOwnProperty("rank")&&(c.node(a).prefRank=b.rank)}),a.parent&&a.nodes().forEach(function(b){c.parent(b,a.parent(b))}),a.eachEdge(function(a,b,d,e){e===undefined&&(e={});var f={e:a,minLen:e.minLen||1,width:e.width||0,height:e.height||0,points:[]};c.addEdge(null,b,d,f)});var d=a.graph()||{};return c.graph({rankDir:d.rankDir||b.rankDir,orderRestarts:d.orderRestarts}),c}function k(a){var g=i.rankSep(),h;try{return h=d.time("initLayoutGraph",j)(a),h.order()===0?h:(h.eachEdge(function(a,b,c,d){d.minLen*=2}),i.rankSep(g/2),d.time("rank.run",e.run)(h,b.rankSimplex),d.time("normalize",l)(h),d.time("order",f)(h,b.orderMaxSweeps),d.time("position",c.run)(h),d.time("undoNormalize",m)(h),d.time("fixupEdgePoints",n)(h),d.time("rank.restoreEdges",e.restoreEdges)(h),d.time("createFinalGraph",o)(h,a.isDirected()))}finally{i.rankSep(g)}}function l(a){var b=0;a.eachEdge(function(c,d,e,f){var g=a.node(d).rank,h=a.node(e).rank;if(g+1<h){for(var i=d,j=g+1,k=0;j<h;++j,++k){var l="_D"+ ++b,m={width:f.width,height:f.height,edge:{id:c,source:d,target:e,attrs:f},rank:j,dummy:!0};k===0?m.index=0:j+1===h&&(m.index=1),a.addNode(l,m),a.addEdge(null,i,l,{}),i=l}a.addEdge(null,i,e,{}),a.delEdge(c)}})}function m(a){a.eachNode(function(b,c){if(c.dummy){if("index"in c){var d=c.edge;a.hasEdge(d.id)||a.addEdge(d.id,d.source,d.target,d.attrs);var e=a.edge(d.id).points;e[c.index]={x:c.x,y:c.y,ul:c.ul,ur:c.ur,dl:c.dl,dr:c.dr}}a.delNode(b)}})}function n(a){a.eachEdge(function(a,b,c,d){d.reversed&&d.points.reverse()})}function o(a,b){var c=b?new h:new g;c.graph(a.graph()),a.eachNode(function(a,b){c.addNode(a,b)}),a.eachNode(function(b){c.parent(b,a.parent(b))}),a.eachEdge(function(a,b,d,e){c.addEdge(e.e,b,d,e)});var d=0,e=0;return a.eachNode(function(b,c){a.children(b).length||(d=Math.max(d,c.x+c.width/2),e=Math.max(e,c.y+c.height/2))}),a.eachEdge(function(a,b,c,f){var g=Math.max.apply(Math,f.points.map(function(a){return a.x})),h=Math.max.apply(Math,f.points.map(function(a){return a.y}));d=Math.max(d,g+f.width/2),e=Math.max(e,h+f.height/2)}),c.graph().width=d,c.graph().height=e,c}function p(a){return function(){return arguments.length?(a.apply(null,arguments),i):a()}}var b={debugLevel:0,orderMaxSweeps:f.DEFAULT_MAX_SWEEPS,rankSimplex:!1,rankDir:"TB"},c=a("./position")(),i={};return i.orderIters=d.propertyAccessor(i,b,"orderMaxSweeps"),i.rankSimplex=d.propertyAccessor(i,b,"rankSimplex"),i.nodeSep=p(c.nodeSep),i.edgeSep=p(c.edgeSep),i.universalSep=p(c.universalSep),i.rankSep=p(c.rankSep),i.rankDir=d.propertyAccessor(i,b,"rankDir"),i.debugAlignment=p(c.debugAlignment),i.debugLevel=d.propertyAccessor(i,b,"debugLevel",function(a){d.log.level=a,c.debugLevel(a)}),i.run=d.time("Total layout",k),i._normalize=l,i}},{"./order":4,"./position":9,"./rank":10,"./util":17,graphlib:24}],4:[function(a,b,c){function k(a,b){function o(){a.eachNode(function(a,b){m[a]=b.order})}arguments.length<2&&(b=j);var c=a.graph().orderRestarts||0,h=f(a);h.forEach(function(b){b=b.filterNodes(function(b){return!a.children(b).length})});var i=0,k,l=Number.MAX_VALUE,m={};for(var p=0;p<Number(c)+1&&l!==0;++p){k=Number.MAX_VALUE,g(a,c>0),d.log(2,"Order phase start cross count: "+a.graph().orderInitCC);var q,r,s;for(q=0,r=0;r<4&&q<b&&k>0;++q,++r,++i)n(a,h,q),s=e(a),s<k&&(r=0,k=s,s<l&&(o(),l=s)),d.log(3,"Order phase start "+p+" iter "+q+" cross count: "+s)}Object.keys(m).forEach(function(b){if(!a.children||!a.children(b).length)a.node(b).order=m[b]}),a.graph().orderCC=l,d.log(2,"Order iterations: "+i),d.log(2,"Order phase best cross count: "+a.graph().orderCC)}function l(a,b){var c={};return b.forEach(function(b){c[b]=a.inEdges(b).map(function(b){return a.node(a.source(b)).order})}),c}function m(a,b){var c={};return b.forEach(function(b){c[b]=a.outEdges(b).map(function(b){return a.node(a.target(b)).order})}),c}function n(a,b,c){c%2===0?o(a,b,c):p(a,b,c)}function o(a,b){var c;for(i=1;i<b.length;++i)c=h(b[i],c,l(a,b[i].nodes()))}function p(a,b){var c;for(i=b.length-2;i>=0;--i)h(b[i],c,m(a,b[i].nodes()))}var d=a("./util"),e=a("./order/crossCount"),f=a("./order/initLayerGraphs"),g=a("./order/initOrder"),h=a("./order/sortLayer");b.exports=k;var j=24;k.DEFAULT_MAX_SWEEPS=j},{"./order/crossCount":5,"./order/initLayerGraphs":6,"./order/initOrder":7,"./order/sortLayer":8,"./util":17}],5:[function(a,b,c){function e(a){var b=0,c=d.ordering(a);for(var e=1;e<c.length;++e)b+=f(a,c[e-1],c[e]);return b}function f(a,b,c){var d=[];b.forEach(function(b){var c=[];a.outEdges(b).forEach(function(b){c.push(a.node(a.target(b)).order)}),c.sort(function(a,b){return a-b}),d=d.concat(c)});var e=1;while(e<c.length)e<<=1;var f=2*e-1;e-=1;var g=[];for(var h=0;h<f;++h)g[h]=0;var i=0;return d.forEach(function(a){var b=a+e;++g[b];while(b>0)b%2&&(i+=g[b+1]),b=b-1>>1,++g[b]}),i}var d=a("../util");b.exports=e},{"../util":17}],6:[function(a,b,c){function f(a){function c(d){if(d===null){a.children(d).forEach(function(a){c(a)});return}var f=a.node(d);f.minRank="rank"in f?f.rank:Number.MAX_VALUE,f.maxRank="rank"in f?f.rank:Number.MIN_VALUE;var h=new e;return a.children(d).forEach(function(b){var d=c(b);h=e.union([h,d]),f.minRank=Math.min(f.minRank,a.node(b).minRank),f.maxRank=Math.max(f.maxRank,a.node(b).maxRank)}),"rank"in f&&h.add(f.rank),h.keys().forEach(function(a){a in b||(b[a]=[]),b[a].push(d)}),h}var b=[];c(null);var f=[];return b.forEach(function(b,c){f[c]=a.filterNodes(d(b))}),f}var d=a("graphlib").filter.nodesFromList,e=a("cp-data").Set;b.exports=f},{"cp-data":19,graphlib:24}],7:[function(a,b,c){function f(a,b){var c=[];a.eachNode(function(b,d){var e=c[d.rank];if(a.children&&a.children(b).length>0)return;e||(e=c[d.rank]=[]),e.push(b)}),c.forEach(function(c){b&&e.shuffle(c),c.forEach(function(b,c){a.node(b).order=c})});var f=d(a);a.graph().orderInitCC=f,a.graph().orderCC=Number.MAX_VALUE}var d=a("./crossCount"),e=a("../util");b.exports=f},{"../util":17,"./crossCount":5}],8:[function(a,b,c){function e(a,b,c){var e=[],f={};a.eachNode(function(a,b){e[b.order]=a;var g=c[a];g.length&&(f[a]=d.sum(g)/g.length)});var g=a.nodes().filter(function(a){return f[a]!==undefined});g.sort(function(b,c){return f[b]-f[c]||a.node(b).order-a.node(c).order});for(var h=0,i=0,j=g.length;i<j;++h)f[e[h]]!==undefined&&(a.node(g[i++]).order=h)}var d=a("../util");b.exports=e},{"../util":17}],9:[function(a,b,c){var d=a("./util");b.exports=function(){function c(b){b=b.filterNodes(d.filterNonSubgraphs(b));var c=d.ordering(b),e=f(b,c),i={};["u","d"].forEach(function(d){d==="d"&&c.reverse(),["l","r"].forEach(function(f){f==="r"&&m(c);var j=d+f,k=g(b,c,e,d==="u"?"predecessors":"successors");i[j]=h(b,c,k.pos,k.root,k.align),a.debugLevel>=3&&t(d+f,b,c,i[j]),f==="r"&&l(i[j]),f==="r"&&m(c)}),d==="d"&&c.reverse()}),k(b,c,i),b.eachNode(function(a){var c=[];for(var d in i){var e=i[d][a];r(d,b,a,e),c.push(e)}c.sort(function(a,b){return a-b}),q(b,a,(c[1]+c[2])/2)});var j=0,p=b.graph().rankDir==="BT"||b.graph().rankDir==="RL";c.forEach(function(c){var e=d.max(c.map(function(a){return o(b,a)}));j+=e/2,c.forEach(function(a){s(b,a,p?-j:j)}),j+=e/2+a.rankSep});var u=d.min(b.nodes().map(function(a){return q(b,a)-n(b,a)/2})),v=d.min(b.nodes().map(function(a){return s(b,a)-o(b,a)/2}));b.eachNode(function(a){q(b,a,q(b,a)-u),s(b,a,s(b,a)-v)})}function e(a,b){return a<b?a.toString().length+":"+a+"-"+b:b.toString().length+":"+b+"-"+a}function f(a,b){function k(a){var b=d[a];if(b<h||b>j)c[e(g[i],a)]=!0}var c={},d={},f,g,h,i,j;if(b.length<=2)return c;b[1].forEach(function(a,b){d[a]=b});for(var l=1;l<b.length-1;++l){f=b[l],g=b[l+1],h=0,i=0;for(var m=0;m<g.length;++m){var n=g[m];d[n]=m,j=undefined;if(a.node(n).dummy){var o=a.predecessors(n)[0];o!==undefined&&a.node(o).dummy&&(j=d[o])}j===undefined&&m===g.length-1&&(j=f.length-1);if(j!==undefined){for(;i<=m;++i)a.predecessors(g[i]).forEach(k);h=j}}}return c}function g(a,b,c,d){var f={},g={},h={};return b.forEach(function(a){a.forEach(function(a,b){g[a]=a,h[a]=a,f[a]=b})}),b.forEach(function(b){var i=-1;b.forEach(function(b){var j=a[d](b),k;j.length>0&&(j.sort(function(a,b){return f[a]-f[b]}),k=(j.length-1)/2,j.slice(Math.floor(k),Math.ceil(k)+1).forEach(function(a){h[b]===b&&!c[e(a,b)]&&i<f[a]&&(h[a]=b,h[b]=g[b]=g[a],i=f[a])}))})}),{pos:f,root:g,align:h}}function h(a,b,c,e,f){function l(a,b,c){b in h[a]?h[a][b]=Math.min(h[a][b],c):h[a][b]=c}function m(b){if(!(b in k)){k[b]=0;var d=b;do{if(c[d]>0){var h=e[j[d]];m(h),g[b]===b&&(g[b]=g[h]);var i=p(a,j[d])+p(a,d);g[b]!==g[h]?l(g[h],g[b],k[b]-k[h]-i):k[b]=Math.max(k[b],k[h]+i)}d=f[d]}while(d!==b)}}var g={},h={},i={},j={},k={};return b.forEach(function(a){a.forEach(function(b,c){g[b]=b,h[b]={},c>0&&(j[b]=a[c-1])})}),d.values(e).forEach(function(a){m(a)}),b.forEach(function(a){a.forEach(function(a){k[a]=k[e[a]];if(a===e[a]&&a===g[a]){var b=0;a in h&&Object.keys(h[a]).length>0&&(b=d.min(Object.keys(h[a]).map(function(b){return h[a][b]+(b in i?i[b]:0)}))),i[a]=b}})}),b.forEach(function(a){a.forEach(function(a){k[a]+=i[g[e[a]]]||0})}),k}function i(a,b,c){return d.min(b.map(function(a){var b=a[0];return c[b]}))}function j(a,b,c){return d.max(b.map(function(a){var b=a[a.length-1];return c[b]}))}function k(a,b,c){function h(a){c[l][a]+=g[l]}var d={},e={},f,g={},k=Number.POSITIVE_INFINITY;for(var l in c){var m=c[l];d[l]=i(a,b,m),e[l]=j(a,b,m);var n=e[l]-d[l];n<k&&(k=n,f=l)}["u","d"].forEach(function(a){["l","r"].forEach(function(b){var c=a+b;g[c]=b==="l"?d[f]-d[c]:e[f]-e[c]})});for(l in c)a.eachNode(h)}function l(a){for(var b in a)a[b]=-a[b]}function m(a){a.forEach(function(a){a.reverse()})}function n(a,b){switch(a.graph().rankDir){case"LR":return a.node(b).height;case"RL":return a.node(b).height;default:return a.node(b).width}}function o(a,b){switch(a.graph().rankDir){case"LR":return a.node(b).width;case"RL":return a.node(b).width;default:return a.node(b).height}}function p(b,c){if(a.universalSep!==null)return a.universalSep;var d=n(b,c),e=b.node(c).dummy?a.edgeSep:a.nodeSep;return(d+e)/2}function q(a,b,c){if(a.graph().rankDir==="LR"||a.graph().rankDir==="RL"){if(arguments.length<3)return a.node(b).y;a.node(b).y=c}else{if(arguments.length<3)return a.node(b).x;a.node(b).x=c}}function r(a,b,c,d){if(b.graph().rankDir==="LR"||b.graph().rankDir==="RL"){if(arguments.length<3)return b.node(c)[a];b.node(c)[a]=d}else{if(arguments.length<3)return b.node(c)[a];b.node(c)[a]=d}}function s(a,b,c){if(a.graph().rankDir==="LR"||a.graph().rankDir==="RL"){if(arguments.length<3)return a.node(b).x;a.node(b).x=c}else{if(arguments.length<3)return a.node(b).y;a.node(b).y=c}}function t(a,b,c,d){c.forEach(function(c,e){var f,g;c.forEach(function(c){var h=d[c];if(f){var i=p(b,f)+p(b,c);h-g<i&&console.log("Position phase: sep violation. Align: "+a+". Layer: "+e+". "+"U: "+f+" V: "+c+". Actual sep: "+(h-g)+" Expected sep: "+i)}f=c,g=h})})}var a={nodeSep:50,edgeSep:10,universalSep:null,rankSep:30},b={};return b.nodeSep=d.propertyAccessor(b,a,"nodeSep"),b.edgeSep=d.propertyAccessor(b,a,"edgeSep"),b.universalSep=d.propertyAccessor(b,a,"universalSep"),b.rankSep=d.propertyAccessor(b,a,"rankSep"),b.debugLevel=d.propertyAccessor(b,a,"debugLevel"),b.run=c,b}},{"./util":17}],10:[function(a,b,c){function l(a,b){n(a),d.time("constraints.apply",h.apply)(a),o(a),d.time("acyclic",e)(a);var c=a.filterNodes(d.filterNonSubgraphs(a));f(c),j(c).forEach(function(a){var d=c.filterNodes(k.nodesFromList(a));r(d,b)}),d.time("constraints.relax",h.relax(a)),d.time("reorientEdges",q)(a)}function m(a){e.undo(a)}function n(a){a.eachEdge(function(b,c,d,e){if(c===d){var f=p(a,b,c,d,e,0,!1),g=p(a,b,c,d,e,1,!0),h=p(a,b,c,d,e,2,!1);a.addEdge(null,f,c,{minLen:1,selfLoop:!0}),a.addEdge(null,f,g,{minLen:1,selfLoop:!0}),a.addEdge(null,c,h,{minLen:1,selfLoop:!0}),a.addEdge(null,g,h,{minLen:1,selfLoop:!0}),a.delEdge(b)}})}function o(a){a.eachEdge(function(b,c,d,e){if(c===d){var f=e.originalEdge,g=p(a,f.e,f.u,f.v,f.value,0,!0);a.addEdge(null,c,g,{minLen:1}),a.addEdge(null,g,d,{minLen:1}),a.delEdge(b)}})}function p(a,b,c,d,e,f,g){return a.addNode(null,{width:g?e.width:0,height:g?e.height:0,edge:{id:b,source:c,target:d,attrs:e},dummy:!0,index:f})}function q(a){a.eachEdge(function(b,c,d,e){a.node(c).rank>a.node(d).rank&&(a.delEdge(b),e.reversed=!0,a.addEdge(b,d,c,e))})}function r(a,b){var c=g(a);b&&(d.log(1,"Using network simplex for ranking"),i(a,c)),s(a)}function s(a){var b=d.min(a.nodes().map(function(b){return a.node(b).rank}));a.eachNode(function(a,c){c.rank-=b})}var d=a("./util"),e=a("./rank/acyclic"),f=a("./rank/initRank"),g=a("./rank/feasibleTree"),h=a("./rank/constraints"),i=a("./rank/simplex"),j=a("graphlib").alg.components,k=a("graphlib").filter;c.run=l,c.restoreEdges=m},{"./rank/acyclic":11,"./rank/constraints":12,"./rank/feasibleTree":13,"./rank/initRank":14,"./rank/simplex":16,"./util":17,graphlib:24}],11:[function(a,b,c){function e(a){function f(d){if(d in c)return;c[d]=b[d]=!0,a.outEdges(d).forEach(function(c){var h=a.target(c),i;d===h?console.error('Warning: found self loop "'+c+'" for node "'+d+'"'):h in b?(i=a.edge(c),a.delEdge(c),i.reversed=!0,++e,a.addEdge(c,h,d,i)):f(h)}),delete b[d]}var b={},c={},e=0;return a.eachNode(function(a){f(a)}),d.log(2,"Acyclic Phase: reversed "+e+" edge(s)"),e}function f(a){a.eachEdge(function(b,c,d,e){e.reversed&&(delete e.reversed,a.delEdge(b),a.addEdge(b,d,c,e))})}var d=a("../util");b.exports=e,b.exports.undo=f},{"../util":17}],12:[function(a,b,c){function d(a){return a!=="min"&&a!=="max"&&a.indexOf("same_")!==0?(console.error("Unsupported rank type: "+a),!1):!0}function e(a,b,c,d){a.inEdges(b).forEach(function(b){var e=a.edge(b),f;e.originalEdge?f=e:f={originalEdge:{e:b,u:a.source(b),v:a.target(b),value:e},minLen:a.edge(b).minLen},e.selfLoop&&(d=!1),d?(a.addEdge(null,c,a.source(b),f),f.reversed=!0):a.addEdge(null,a.source(b),c,f)})}function f(a,b,c,d){a.outEdges(b).forEach(function(b){var e=a.edge(b),f;e.originalEdge?f=e:f={originalEdge:{e:b,u:a.source(b),v:a.target(b),value:e},minLen:a.edge(b).minLen},e.selfLoop&&(d=!1),d?(a.addEdge(null,a.target(b),c,f),f.reversed=!0):a.addEdge(null,c,a.target(b),f)})}function g(a,b,c){c!==undefined&&a.children(b).forEach(function(b){b!==c&&!a.outEdges(c,b).length&&!a.node(b).dummy&&a.addEdge(null,c,b,{minLen:0})})}function h(a,b,c){c!==undefined&&a.children(b).forEach(function(b){b!==c&&!a.outEdges(b,c).length&&!a.node(b).dummy&&a.addEdge(null,b,c,{minLen:0})})}c.apply=function(a){function b(c){var i={};a.children(c).forEach(function(g){if(a.children(g).length){b(g);return}var h=a.node(g),j=h.prefRank;if(j!==undefined){if(!d(j))return;j in i?i.prefRank.push(g):i.prefRank=[g];var k=i[j];k===undefined&&(k=i[j]=a.addNode(null,{originalNodes:[]}),a.parent(k,c)),e(a,g,k,j==="min"),f(a,g,k,j==="max"),a.node(k).originalNodes.push({u:g,value:h,parent:c}),a.delNode(g)}}),g(a,c,i.min),h(a,c,i.max)}b(null)},c.relax=function(a){var b=[];a.eachEdge(function(a,c,d,e){var f=e.originalEdge;f&&b.push(f)}),a.eachNode(function(b,c){var d=c.originalNodes;d&&(d.forEach(function(b){b.value.rank=c.rank,a.addNode(b.u,b.value),a.parent(b.u,b.parent)}),a.delNode(b))}),b.forEach(function(b){a.addEdge(b.e,b.u,b.v,b.value)})}},{}],13:[function(a,b,c){function g(a){function g(d){var e=!0;return a.predecessors(d).forEach(function(f){b.has(f)&&!h(a,f,d)&&(b.has(d)&&(c.addNode(d,{}),b.remove(d),c.graph({root:d})),c.addNode(f,{}),c.addEdge(null,f,d,{reversed:!0}),b.remove(f),g(f),e=!1)}),a.successors(d).forEach(function(f){b.has(f)&&!h(a,d,f)&&(b.has(d)&&(c.addNode(d,{}),b.remove(d),c.graph({root:d})),c.addNode(f,{}),c.addEdge(null,d,f,{}),b.remove(f),g(f),e=!1)}),e}function i(){var d=Number.MAX_VALUE;b.keys().forEach(function(c){a.predecessors(c).forEach(function(e){if(!b.has(e)){var f=h(a,e,c);Math.abs(f)<Math.abs(d)&&(d=-f)}}),a.successors(c).forEach(function(e){if(!b.has(e)){var f=h(a,c,e);Math.abs(f)<Math.abs(d)&&(d=f)}})}),c.eachNode(function(b){a.node(b).rank-=d})}var b=new d(a.nodes()),c=new e;if(b.size()===1){var f=a.nodes()[0];return c.addNode(f,{}),c.graph({root:f}),c}while(b.size()){var j=c.order()?c.nodes():b.keys();for(var k=0,l=j.length;k<l&&g(j[k]);++k);b.size()&&i()}return c}function h(a,b,c){var d=a.node(c).rank-a.node(b).rank,e=f.max(a.outEdges(b,c).map(function(b){return a.edge(b).minLen}));return d-e}var d=a("cp-data").Set,e=a("graphlib").Digraph,f=a("../util");b.exports=g},{"../util":17,"cp-data":19,graphlib:24}],14:[function(a,b,c){function f(a){var b=e(a);b.forEach(function(b){var c=a.inEdges(b);if(c.length===0){a.node(b).rank=0;return}var e=c.map(function(b){return a.node(a.source(b)).rank+a.edge(b).minLen});a.node(b).rank=d.max(e)})}var d=a("../util"),e=a("graphlib").alg.topsort;b.exports=f},{"../util":17,graphlib:24}],15:[function(a,b,c){function d(a,b,c,d){return Math.abs(a.node(b).rank-a.node(c).rank)-d}b.exports={slack:d}},{}],16:[function(a,b,c){function f(a,b){g(a,b);for(;;){var c=k(b);if(c===null)break;var d=l(a,b,c);m(a,b,c,d)}}function g(a,b){function c(d){var e=b.successors(d);for(var f in e){var g=e[f];c(g)}d!==b.graph().root&&i(a,b,d)}h(b),b.eachEdge(function(a,b,c,d){d.cutValue=0}),c(b.graph().root)}function h(a){function c(d){var e=a.successors(d),f=b;for(var g in e){var h=e[g];c(h),f=Math.min(f,a.node(h).low)}a.node(d).low=f,a.node(d).lim=b++}var b=0;c(a.graph().root)}function i(a,b,c){var d=b.inEdges(c)[0],e=[],f=b.outEdges(c);for(var g in f)e.push(b.target(f[g]));var h=0,i=0,k=0,l=0,m=0,n=a.outEdges(c),o;for(var p in n){var q=a.target(n[p]);for(o in e)j(b,q,e[o])&&i++;j(b,q,c)||l++}var r=a.inEdges(c);for(var s in r){var t=a.source(r[s]);for(o in e)j(b,t,e[o])&&k++;j(b,t,c)||m++}var u=0;for(o in e){var v=b.edge(f[o]).cutValue;b.edge(f[o]).reversed?u-=v:u+=v}b.edge(d).reversed?h-=u-i+k-l+m:h+=u-i+k-l+m,b.edge(d).cutValue=h}function j(a,b,c){return a.node(c).low<=a.node(b).lim&&a.node(b).lim<=a.node(c).lim}function k(a){var b=a.edges();for(var c in b){var d=b[c],e=a.edge(d);if(e.cutValue<0)return d}return null}function l(a,b,c){var d=b.source(c),f=b.target(c),g=b.node(f).lim<b.node(d).lim?f:d,h=!b.edge(c).reversed,i=Number.POSITIVE_INFINITY,k;h?a.eachEdge(function(d,f,h,l){if(d!==c&&j(b,f,g)&&!j(b,h,g)){var m=e.slack(a,f,h,l.minLen);m<i&&(i=m,k=d)}}):a.eachEdge(function(d,f,h,l){if(d!==c&&!j(b,f,g)&&j(b,h,g)){var m=e.slack(a,f,h,l.minLen);m<i&&(i=m,k=d)}});if(k===undefined){var l=[],m=[];throw a.eachNode(function(a){j(b,a,g)?m.push(a):l.push(a)}),new Error("No edge found from outside of tree to inside")}return k}function m(a,b,c,d){function h(a){var c=b.inEdges(a);for(var d in c){var e=c[d],f=b.source(e),g=b.edge(e);h(f),b.delEdge(e),g.reversed=!g.reversed,b.addEdge(e,a,f,g)}}b.delEdge(c);var e=a.source(d),f=a.target(d);h(f);var i=e,j=b.inEdges(i);while(j.length>0)i=b.source(j[0]),j=b.inEdges(i);b.graph().root=i,b.addEdge(null,e,f,{cutValue:0}),g(a,b),n(a,b)}function n(a,b){function c(d){var e=b.successors(d);e.forEach(function(b){var e=o(a,d,b);a.node(b).rank=a.node(d).rank+e,c(b)})}c(b.graph().root)}function o(a,b,c){var e=a.outEdges(b,c);if(e.length>0)return d.max(e.map(function(b){return a.edge(b).minLen}));var f=a.inEdges(b,c);if(f.length>0)return-d.max(f.map(function(b){return a.edge(b).minLen}))}var d=a("../util"),e=a("./rankUtil");b.exports=f},{"../util":17,"./rankUtil":15}],17:[function(a,b,c){function d(a,b){return function(){var c=(new Date).getTime();try{return b.apply(null,arguments)}finally{e(1,a+" time: "+((new Date).getTime()-c)+"ms")}}}function e(a){e.level>=a&&console.log.apply(console,Array.prototype.slice.call(arguments,1))}c.min=function(a){return Math.min.apply(Math,a)},c.max=function(a){return Math.max.apply(Math,a)},c.all=function(a,b){for(var c=0;c<a.length;++c)if(!b(a[c]))return!1;return!0},c.sum=function(a){return a.reduce(function(a,b){return a+b},0)},c.values=function(a){return Object.keys(a).map(function(b){return a[b]})},c.shuffle=function(a){for(i=a.length-1;i>0;--i){var b=Math.floor(Math.random()*(i+1)),c=a[b];a[b]=a[i],a[i]=c}},c.propertyAccessor=function(a,b,c,d){return function(e){return arguments.length?(b[c]=e,d&&d(e),a):b[c]}},c.ordering=function(a){var b=[];return a.eachNode(function(a,c){var d=b[c.rank]||(b[c.rank]=[]);d[c.order]=a}),b},c.filterNonSubgraphs=function(a){return function(b){return a.children(b).length===0}},d.enabled=!1,c.time=d,e.level=0,c.log=e},{}],18:[function(a,b,c){b.exports="0.4.5"},{}],19:[function(a,b,c){c.Set=a("./lib/Set"),c.PriorityQueue=a("./lib/PriorityQueue"),c.version=a("./lib/version")},{"./lib/PriorityQueue":20,"./lib/Set":21,"./lib/version":23}],20:[function(a,b,c){function d(){this._arr=[],this._keyIndices={}}b.exports=d,d.prototype.size=function(){return this._arr.length},d.prototype.keys=function(){return this._arr.map(function(a){return a.key})},d.prototype.has=function(a){return a in this._keyIndices},d.prototype.priority=function(a){var b=this._keyIndices[a];if(b!==undefined)return this._arr[b].priority},d.prototype.min=function(){if(this.size()===0)throw new Error("Queue underflow");return this._arr[0].key},d.prototype.add=function(a,b){var c=this._keyIndices;if(a in c)return!1;var d=this._arr,e=d.length;return c[a]=e,d.push({key:a,priority:b}),this._decrease(e),!0},d.prototype.removeMin=function(){this._swap(0,this._arr.length-1);var a=this._arr.pop();return delete this._keyIndices[a.key],this._heapify(0),a.key},d.prototype.decrease=function(a,b){var c=this._keyIndices[a];if(b>this._arr[c].priority)throw new Error("New priority is greater than current priority. Key: "+a+" Old: "+this._arr[c].priority+" New: "+b);this._arr[c].priority=b,this._decrease(c)},d.prototype._heapify=function(a){var b=this._arr,c=2*a,d=c+1,e=a;c<b.length&&(e=b[c].priority<b[e].priority?c:e,d<b.length&&(e=b[d].priority<b[e].priority?d:e),e!==a&&(this._swap(a,e),this._heapify(e)))},d.prototype._decrease=function(a){var b=this._arr,c=b[a].priority,d;while(a!==0){d=a>>1;if(b[d].priority<c)break;this._swap(a,d),a=d}},d.prototype._swap=function(a,b){var c=this._arr,d=this._keyIndices,e=c[a],f=c[b];c[a]=f,c[b]=e,d[f.key]=a,d[e.key]=b}},{}],21:[function(a,b,c){function e(a){this._size=0,this._keys={};if(a)for(var b=0,c=a.length;b<c;++b)this.add(a[b])}function f(a){var b=Object.keys(a),c=b.length,d=new Array(c),e;for(e=0;e<c;++e)d[e]=a[b[e]];return d}var d=a("./util");b.exports=e,e.intersect=function(a){if(a.length===0)return new e;var b=new e(d.isArray(a[0])?a[0]:a[0].keys());for(var c=1,f=a.length;c<f;++c){var g=b.keys(),h=d.isArray(a[c])?new e(a[c]):a[c];for(var i=0,j=g.length;i<j;++i){var k=g[i];h.has(k)||b.remove(k)}}return b},e.union=function(a){var b=d.reduce(a,function(a,b){return a+(b.size?b.size():b.length)},0),c=new Array(b),f=0;for(var g=0,h=a.length;g<h;++g){var i=a[g],j=d.isArray(i)?i:i.keys();for(var k=0,l=j.length;k<l;++k)c[f++]=j[k]}return new e(c)},e.prototype.size=function(){return this._size},e.prototype.keys=function(){return f(this._keys)},e.prototype.has=function(a){return a in this._keys},e.prototype.add=function(a){return a in this._keys?!1:(this._keys[a]=a,++this._size,!0)},e.prototype.remove=function(a){return a in this._keys?(delete this._keys[a],--this._size,!0):!1}},{"./util":22}],22:[function(a,b,c){Array.isArray?c.isArray=Array.isArray:c.isArray=function(a){return Object.prototype.toString.call(a)==="[object Array]"},"function"!=typeof Array.prototype.reduce?c.reduce=function(a,b,c){"use strict";if(null===a||"undefined"==typeof a)throw new TypeError("Array.prototype.reduce called on null or undefined");if("function"!=typeof b)throw new TypeError(b+" is not a function");var d,e,f=a.length>>>0,g=!1;1<arguments.length&&(e=c,g=!0);for(d=0;f>d;++d)a.hasOwnProperty(d)&&(g?e=b(e,a[d],d,a):(e=a[d],g=!0));if(!g)throw new TypeError("Reduce of empty array with no initial value");return e}:c.reduce=function(a,b,c){return a.reduce(b,c)}},{}],23:[function(a,b,c){b.exports="1.1.3"},{}],24:[function(a,b,c){c.Graph=a("./lib/Graph"),c.Digraph=a("./lib/Digraph"),c.CGraph=a("./lib/CGraph"),c.CDigraph=a("./lib/CDigraph"),a("./lib/graph-converters"),c.alg={isAcyclic:a("./lib/alg/isAcyclic"),components:a("./lib/alg/components"),dijkstra:a("./lib/alg/dijkstra"),dijkstraAll:a("./lib/alg/dijkstraAll"),findCycles:a("./lib/alg/findCycles"),floydWarshall:a("./lib/alg/floydWarshall"),postorder:a("./lib/alg/postorder"),preorder:a("./lib/alg/preorder"),prim:a("./lib/alg/prim"),tarjan:a("./lib/alg/tarjan"),topsort:a("./lib/alg/topsort")},c.converter={json:a("./lib/converter/json.js")};var d=a("./lib/filter");c.filter={all:d.all,nodesFromList:d.nodesFromList},c.version=a("./lib/version")},{"./lib/CDigraph":26,"./lib/CGraph":27,"./lib/Digraph":28,"./lib/Graph":29,"./lib/alg/components":30,"./lib/alg/dijkstra":31,"./lib/alg/dijkstraAll":32,"./lib/alg/findCycles":33,"./lib/alg/floydWarshall":34,"./lib/alg/isAcyclic":35,"./lib/alg/postorder":36,"./lib/alg/preorder":37,"./lib/alg/prim":38,"./lib/alg/tarjan":39,"./lib/alg/topsort":40,"./lib/converter/json.js":42,"./lib/filter":43,"./lib/graph-converters":44,"./lib/version":46}],25:[function(a,b,c){function e(){this._value=undefined,this._nodes={},this._edges={},this._nextId=0}function f(a,b,c){(a[b]||(a[b]=new d)).add(c)}function g(a,b,c){var d=a[b];d.remove(c),d.size()===0&&delete a[b]}var d=a("cp-data").Set;b.exports=e,e.prototype.order=function(){return Object.keys(this._nodes).length},e.prototype.size=function(){return Object.keys(this._edges).length},e.prototype.graph=function(a){if(arguments.length===0)return this._value;this._value=a},e.prototype.hasNode=function(a){return a in this._nodes},e.prototype.node=function(a,b){var c=this._strictGetNode(a);if(arguments.length===1)return c.value;c.value=b},e.prototype.nodes=function(){var a=[];return this.eachNode(function(b){a.push(b)}),a},e.prototype.eachNode=function(a){for(var b in this._nodes){var c=this._nodes[b];a(c.id,c.value)}},e.prototype.hasEdge=function(a){return a in this._edges},e.prototype.edge=function(a,b){var c=this._strictGetEdge(a);if(arguments.length===1)return c.value;c.value=b},e.prototype.edges=function(){var a=[];return this.eachEdge(function(b){a.push(b)}),a},e.prototype.eachEdge=function(a){for(var b in this._edges){var c=this._edges[b];a(c.id,c.u,c.v,c.value)}},e.prototype.incidentNodes=function(a){var b=this._strictGetEdge(a);return[b.u,b.v]},e.prototype.addNode=function(a,b){if(a===undefined||a===null){do a="_"+ ++this._nextId;while(this.hasNode(a))}else if(this.hasNode(a))throw new Error("Graph already has node '"+a+"'");return this._nodes[a]={id:a,value:b},a},e.prototype.delNode=function(a){this._strictGetNode(a),this.incidentEdges(a).forEach(function(a){this.delEdge(a)},this),delete this._nodes[a]},e.prototype._addEdge=function(a,b,c,d,e,g){this._strictGetNode(b),this._strictGetNode(c);if(a===undefined||a===null){do a="_"+ ++this._nextId;while(this.hasEdge(a))}else if(this.hasEdge(a))throw new Error("Graph already has edge '"+a+"'");return this._edges[a]={id:a,u:b,v:c,value:d},f(e[c],b,a),f(g[b],c,a),a},e.prototype._delEdge=function(a,b,c){var d=this._strictGetEdge(a);g(b[d.v],d.u,a),g(c[d.u],d.v,a),delete this._edges[a]},e.prototype.copy=function(){var a=new this.constructor;return a.graph(this.graph()),this.eachNode(function(b,c){a.addNode(b,c)}),this.eachEdge(function(b,c,d,e){a.addEdge(b,c,d,e)}),a._nextId=this._nextId,a},e.prototype.filterNodes=function(a){var b=new this.constructor;return b.graph(this.graph()),this.eachNode(function(c,d){a(c)&&b.addNode(c,d)}),this.eachEdge(function(a,c,d,e){b.hasNode(c)&&b.hasNode(d)&&b.addEdge(a,c,d,e)}),b},e.prototype._strictGetNode=function(a){var b=this._nodes[a];if(b===undefined)throw new Error("Node '"+a+"' is not in graph");return b},e.prototype._strictGetEdge=function(a){var b=this._edges[a];if(b===undefined)throw new Error("Edge '"+a+"' is not in graph");return b}},{"cp-data":19}],26:[function(a,b,c){var d=a("./Digraph"),e=a("./compoundify"),f=e(d);b.exports=f,f.fromDigraph=function(a){var b=new f,c=a.graph();return c!==undefined&&b.graph(c),a.eachNode(function(a,c){c===undefined?b.addNode(a):b.addNode(a,c)}),a.eachEdge(function(a,c,d,e){e===undefined?b.addEdge(null,c,d):b.addEdge(null,c,d,e)}),b},f.prototype.toString=function(){return"CDigraph "+JSON.stringify(this,null,2)}},{"./Digraph":28,"./compoundify":41}],27:[function(a,b,c){var d=a("./Graph"),e=a("./compoundify"),f=e(d);b.exports=f,f.fromGraph=function(a){var b=new f,c=a.graph();return c!==undefined&&b.graph(c),a.eachNode(function(a,c){c===undefined?b.addNode(a):b.addNode(a,c)}),a.eachEdge(function(a,c,d,e){e===undefined?b.addEdge(null,c,d):b.addEdge(null,c,d,e)}),b},f.prototype.toString=function(){return"CGraph "+JSON.stringify(this,null,2)}},{"./Graph":29,"./compoundify":41}],28:[function(a,b,c){function g(){e.call(this),this._inEdges={},this._outEdges={}}var d=a("./util"),e=a("./BaseGraph"),f=a("cp-data").Set;b.exports=g,g.prototype=new e,g.prototype.constructor=g,g.prototype.isDirected=function(){return!0},g.prototype.successors=function(a){return this._strictGetNode(a),Object.keys(this._outEdges[a]).map(function(a){return this._nodes[a].id},this)},g.prototype.predecessors=function(a){return this._strictGetNode(a),Object.keys(this._inEdges[a]).map(function(a){return this._nodes[a].id},this)},g.prototype.neighbors=function(a){return f.union([this.successors(a),this.predecessors(a)]).keys()},g.prototype.sources=function(){var a=this;return this._filterNodes(function(b){return a.inEdges(b).length===0})},g.prototype.sinks=function(){var a=this;return this._filterNodes(function(b){return a.outEdges(b).length===0})},g.prototype.source=function(a){return this._strictGetEdge(a).u},g.prototype.target=function(a){return this._strictGetEdge(a).v},g.prototype.inEdges=function(a,b){this._strictGetNode(a);var c=f.union(d.values(this._inEdges[a])).keys();return arguments.length>1&&(this._strictGetNode(b),c=c.filter(function(a){return this.source(a)===b},this)),c},g.prototype.outEdges=function(a,b){this._strictGetNode(a);var c=f.union(d.values(this._outEdges[a])).keys();return arguments.length>1&&(this._strictGetNode(b),c=c.filter(function(a){return this.target(a)===b},this)),c},g.prototype.incidentEdges=function(a,b){return arguments.length>1?f.union([this.outEdges(a,b),this.outEdges(b,a)]).keys():f.union([this.inEdges(a),this.outEdges(a)]).keys()},g.prototype.toString=function(){return"Digraph "+JSON.stringify(this,null,2)},g.prototype.addNode=function(a,b){return a=e.prototype.addNode.call(this,a,b),this._inEdges[a]={},this._outEdges[a]={},a},g.prototype.delNode=function(a){e.prototype.delNode.call(this,a),delete this._inEdges[a],delete this._outEdges[a]},g.prototype.addEdge=function(a,b,c,d){return e.prototype._addEdge.call(this,a,b,c,d,this._inEdges,this._outEdges)},g.prototype.delEdge=function(a){e.prototype._delEdge.call(this,a,this._inEdges,this._outEdges)},g.prototype._filterNodes=function(a){var b=[];return this.eachNode(function(c){a(c)&&b.push(c)}),b}},{"./BaseGraph":25,"./util":45,"cp-data":19}],29:[function(a,b,c){function g(){e.call(this),this._incidentEdges={}}var d=a("./util"),e=a("./BaseGraph"),f=a("cp-data").Set;b.exports=g,g.prototype=new e,g.prototype.constructor=g,g.prototype.isDirected=function(){return!1},g.prototype.neighbors=function(a){return this._strictGetNode(a),Object.keys(this._incidentEdges[a]).map(function(a){return this._nodes[a].id},this)},g.prototype.incidentEdges=function(a,b){return this._strictGetNode(a),arguments.length>1?(this._strictGetNode(b),b in this._incidentEdges[a]?this._incidentEdges[a][b].keys():[]):f.union(d.values(this._incidentEdges[a])).keys()},g.prototype.toString=function(){return"Graph "+JSON.stringify(this,null,2)},g.prototype.addNode=function(a,b){return a=e.prototype.addNode.call(this,a,b),this._incidentEdges[a]={},a},g.prototype.delNode=function(a){e.prototype.delNode.call(this,a),delete this._incidentEdges[a]},g.prototype.addEdge=function(a,b,c,d){return e.prototype._addEdge.call(this,a,b,c,d,this._incidentEdges,this._incidentEdges)},g.prototype.delEdge=function(a){e.prototype._delEdge.call(this,a,this.
_incidentEdges,this._incidentEdges)}},{"./BaseGraph":25,"./util":45,"cp-data":19}],30:[function(a,b,c){function e(a){function e(b,d){c.has(b)||(c.add(b),d.push(b),a.neighbors(b).forEach(function(a){e(a,d)}))}var b=[],c=new d;return a.nodes().forEach(function(a){var c=[];e(a,c),c.length>0&&b.push(c)}),b}var d=a("cp-data").Set;b.exports=e},{"cp-data":19}],31:[function(a,b,c){function e(a,b,c,e){function h(b){var d=a.incidentNodes(b),e=d[0]!==i?d[0]:d[1],h=f[e],k=c(b),l=j.distance+k;if(k<0)throw new Error("dijkstra does not allow negative edge weights. Bad edge: "+b+" Weight: "+k);l<h.distance&&(h.distance=l,h.predecessor=i,g.decrease(e,l))}var f={},g=new d;c=c||function(){return 1},e=e||(a.isDirected()?function(b){return a.outEdges(b)}:function(b){return a.incidentEdges(b)}),a.eachNode(function(a){var c=a===b?0:Number.POSITIVE_INFINITY;f[a]={distance:c},g.add(a,c)});var i,j;while(g.size()>0){i=g.removeMin(),j=f[i];if(j.distance===Number.POSITIVE_INFINITY)break;e(i).forEach(h)}return f}var d=a("cp-data").PriorityQueue;b.exports=e},{"cp-data":19}],32:[function(a,b,c){function e(a,b,c){var e={};return a.eachNode(function(f){e[f]=d(a,f,b,c)}),e}var d=a("./dijkstra");b.exports=e},{"./dijkstra":31}],33:[function(a,b,c){function e(a){return d(a).filter(function(a){return a.length>1})}var d=a("./tarjan");b.exports=e},{"./tarjan":39}],34:[function(a,b,c){function d(a,b,c){var d={},e=a.nodes();return b=b||function(){return 1},c=c||(a.isDirected()?function(b){return a.outEdges(b)}:function(b){return a.incidentEdges(b)}),e.forEach(function(f){d[f]={},d[f][f]={distance:0},e.forEach(function(a){f!==a&&(d[f][a]={distance:Number.POSITIVE_INFINITY})}),c(f).forEach(function(c){var e=a.incidentNodes(c),h=e[0]!==f?e[0]:e[1],i=b(c);i<d[f][h].distance&&(d[f][h]={distance:i,predecessor:f})})}),e.forEach(function(a){var b=d[a];e.forEach(function(c){var f=d[c];e.forEach(function(c){var d=f[a],e=b[c],g=f[c],h=d.distance+e.distance;h<g.distance&&(g.distance=h,g.predecessor=e.predecessor)})})}),d}b.exports=d},{}],35:[function(a,b,c){function e(a){try{d(a)}catch(b){if(b instanceof d.CycleException)return!1;throw b}return!0}var d=a("./topsort");b.exports=e},{"./topsort":40}],36:[function(a,b,c){function e(a,b,c){function f(b,d){if(e.has(b))throw new Error("The input graph is not a tree: "+a);e.add(b),a.neighbors(b).forEach(function(a){a!==d&&f(a,b)}),c(b)}var e=new d;if(a.isDirected())throw new Error("This function only works for undirected graphs");f(b)}var d=a("cp-data").Set;b.exports=e},{"cp-data":19}],37:[function(a,b,c){function e(a,b,c){function f(b,d){if(e.has(b))throw new Error("The input graph is not a tree: "+a);e.add(b),c(b),a.neighbors(b).forEach(function(a){a!==d&&f(a,b)})}var e=new d;if(a.isDirected())throw new Error("This function only works for undirected graphs");f(b)}var d=a("cp-data").Set;b.exports=e},{"cp-data":19}],38:[function(a,b,c){function f(a,b){function i(c){var d=a.incidentNodes(c),e=d[0]!==h?d[0]:d[1],i=g.priority(e);if(i!==undefined){var j=b(c);j<i&&(f[e]=h,g.decrease(e,j))}}var c=new d,f={},g=new e,h;if(a.order()===0)return c;a.eachNode(function(a){g.add(a,Number.POSITIVE_INFINITY),c.addNode(a)}),g.decrease(a.nodes()[0],0);var j=!1;while(g.size()>0){h=g.removeMin();if(h in f)c.addEdge(null,h,f[h]);else{if(j)throw new Error("Input graph is not connected: "+a);j=!0}a.incidentEdges(h).forEach(i)}return c}var d=a("../Graph"),e=a("cp-data").PriorityQueue;b.exports=f},{"../Graph":29,"cp-data":19}],39:[function(a,b,c){function d(a){function f(h){var i=d[h]={onStack:!0,lowlink:b,index:b++};c.push(h),a.successors(h).forEach(function(a){a in d?d[a].onStack&&(i.lowlink=Math.min(i.lowlink,d[a].index)):(f(a),i.lowlink=Math.min(i.lowlink,d[a].lowlink))});if(i.lowlink===i.index){var j=[],k;do k=c.pop(),d[k].onStack=!1,j.push(k);while(h!==k);e.push(j)}}if(!a.isDirected())throw new Error("tarjan can only be applied to a directed graph. Bad input: "+a);var b=0,c=[],d={},e=[];return a.nodes().forEach(function(a){a in d||f(a)}),e}b.exports=d},{}],40:[function(a,b,c){function d(a){function f(g){if(g in c)throw new e;g in b||(c[g]=!0,b[g]=!0,a.predecessors(g).forEach(function(a){f(a)}),delete c[g],d.push(g))}if(!a.isDirected())throw new Error("topsort can only be applied to a directed graph. Bad input: "+a);var b={},c={},d=[],g=a.sinks();if(a.order()!==0&&g.length===0)throw new e;return a.sinks().forEach(function(a){f(a)}),d}function e(){}b.exports=d,d.CycleException=e,e.prototype.toString=function(){return"Graph has at least one cycle"}},{}],41:[function(a,b,c){function e(a){function b(){a.call(this),this._parents={},this._children={},this._children[null]=new d}return b.prototype=new a,b.prototype.constructor=b,b.prototype.parent=function(a,b){this._strictGetNode(a);if(arguments.length<2)return this._parents[a];if(a===b)throw new Error("Cannot make "+a+" a parent of itself");b!==null&&this._strictGetNode(b),this._children[this._parents[a]].remove(a),this._parents[a]=b,this._children[b].add(a)},b.prototype.children=function(a){return a!==null&&this._strictGetNode(a),this._children[a].keys()},b.prototype.addNode=function(b,c){return b=a.prototype.addNode.call(this,b,c),this._parents[b]=null,this._children[b]=new d,this._children[null].add(b),b},b.prototype.delNode=function(b){var c=this.parent(b);return this._children[b].keys().forEach(function(a){this.parent(a,c)},this),this._children[c].remove(b),delete this._parents[b],delete this._children[b],a.prototype.delNode.call(this,b)},b.prototype.copy=function(){var b=a.prototype.copy.call(this);return this.nodes().forEach(function(a){b.parent(a,this.parent(a))},this),b},b.prototype.filterNodes=function(b){function f(a){var b=c.parent(a);return b===null||d.hasNode(b)?(e[a]=b,b):b in e?e[b]:f(b)}var c=this,d=a.prototype.filterNodes.call(this,b),e={};return d.eachNode(function(a){d.parent(a,f(a))}),d},b}var d=a("cp-data").Set;b.exports=e},{"cp-data":19}],42:[function(a,b,c){function h(a){return Object.prototype.toString.call(a).slice(8,-1)}var d=a("../Graph"),e=a("../Digraph"),f=a("../CGraph"),g=a("../CDigraph");c.decode=function(a,b,c){c=c||e;if(h(a)!=="Array")throw new Error("nodes is not an Array");if(h(b)!=="Array")throw new Error("edges is not an Array");if(typeof c=="string")switch(c){case"graph":c=d;break;case"digraph":c=e;break;case"cgraph":c=f;break;case"cdigraph":c=g;break;default:throw new Error("Unrecognized graph type: "+c)}var i=new c;return a.forEach(function(a){i.addNode(a.id,a.value)}),i.parent&&a.forEach(function(a){a.children&&a.children.forEach(function(b){i.parent(b,a.id)})}),b.forEach(function(a){i.addEdge(a.id,a.u,a.v,a.value)}),i},c.encode=function(a){var b=[],c=[];a.eachNode(function(c,d){var e={id:c,value:d};if(a.children){var f=a.children(c);f.length&&(e.children=f)}b.push(e)}),a.eachEdge(function(a,b,d,e){c.push({id:a,u:b,v:d,value:e})});var h;if(a instanceof g)h="cdigraph";else if(a instanceof f)h="cgraph";else if(a instanceof e)h="digraph";else if(a instanceof d)h="graph";else throw new Error("Couldn't determine type of graph: "+a);return{nodes:b,edges:c,type:h}}},{"../CDigraph":26,"../CGraph":27,"../Digraph":28,"../Graph":29}],43:[function(a,b,c){var d=a("cp-data").Set;c.all=function(){return function(){return!0}},c.nodesFromList=function(a){var b=new d(a);return function(a){return b.has(a)}}},{"cp-data":19}],44:[function(a,b,c){var d=a("./Graph"),e=a("./Digraph");d.prototype.toDigraph=d.prototype.asDirected=function(){var a=new e;return this.eachNode(function(b,c){a.addNode(b,c)}),this.eachEdge(function(b,c,d,e){a.addEdge(null,c,d,e),a.addEdge(null,d,c,e)}),a},e.prototype.toGraph=e.prototype.asUndirected=function(){var a=new d;return this.eachNode(function(b,c){a.addNode(b,c)}),this.eachEdge(function(b,c,d,e){a.addEdge(b,c,d,e)}),a}},{"./Digraph":28,"./Graph":29}],45:[function(a,b,c){c.values=function(a){var b=Object.keys(a),c=b.length,d=new Array(c),e;for(e=0;e<c;++e)d[e]=a[b[e]];return d}},{}],46:[function(a,b,c){b.exports="0.7.4"},{}]},{},[1]);;
var skanaar = skanaar || {}
skanaar.Canvas = function (canvas, callbacks){
	var ctx = canvas.getContext('2d');
	var mousePos = { x: 0, y: 0 }
	var twopi = 2*3.1416

	function mouseEventToPos(event){
		var e = canvas
		return {
			x: event.clientX - e.getBoundingClientRect().left - e.clientLeft + e.scrollLeft,
			y: event.clientY - e.getBoundingClientRect().top - e.clientTop + e.scrollTop
		}
	}

	if (callbacks) {
		canvas.addEventListener('mousedown', function (event){
			if (callbacks.mousedown) callbacks.mousedown(mouseEventToPos(event))
		})

		canvas.addEventListener('mouseup', function (event){
			if (callbacks.mouseup) callbacks.mouseup(mouseEventToPos(event))
		})

		canvas.addEventListener('mousemove', function (event){
			mousePos = mouseEventToPos(event)
			if (callbacks.mousemove) callbacks.mousemove(mouseEventToPos(event))
		})
	}

	var chainable = {
		stroke: function (){
			ctx.stroke()
			return chainable
		},
		fill: function (){
			ctx.fill()
			return chainable
		}
	}

	function color255(r, g, b, a){
		var optionalAlpha = a === undefined ? 1 : a
		var comps = [Math.floor(r), Math.floor(g), Math.floor(b), optionalAlpha]
		return 'rgba('+ comps.join() +')'
	}

	function tracePath(path, offset, s){
		s = s === undefined ? 1 : s
		offset = offset || {x:0, y:0}
		ctx.beginPath()
		ctx.moveTo(offset.x + s*path[0].x, offset.y + s*path[0].y)
		for(var i=1, len=path.length; i<len; i++)
			ctx.lineTo(offset.x + s*path[i].x, offset.y + s*path[i].y)
		return chainable
	}

	return {
		mousePos: function (){ return mousePos },
		width: function (){ return canvas.width },
		height: function (){ return canvas.height },
		ctx: ctx,
		background: function (r, g, b){
			ctx.fillStyle = color255(r, g, b)
			ctx.fillRect (0, 0, canvas.width, canvas.height)
		},
		clear: function (){
			ctx.clearRect(0, 0, canvas.width, canvas.height)
		},
		circle: function (x, y, r){
			ctx.beginPath()
			if (arguments.length === 2)
				ctx.arc(x.x, x.y, y, 0, twopi)
			else
				ctx.arc(x, y, r, 0, twopi)
			return chainable
		},
		ellipse: function (center, rx, ry, start, stop){
			if (start === undefined) start = 0
			if (stop === undefined) stop = twopi
			ctx.beginPath()
			ctx.save()
			ctx.translate(center.x, center.y)
			ctx.scale(1, ry/rx)
			ctx.arc(0, 0, rx/2, start, stop)
			ctx.restore()
			return chainable
		},
		arc: function (x, y, r, start, stop){
			ctx.beginPath()
			ctx.moveTo(x,y)
			ctx.arc(x, y, r, start, stop)
			return chainable
		},
		roundRect: function (x, y, w, h, r){
			ctx.beginPath()
			ctx.moveTo(x+r, y)
			ctx.arcTo(x+w, y, x+w, y+r, r)
			ctx.lineTo(x+w, y+h-r)
			ctx.arcTo(x+w, y+h, x+w-r, y+h, r)
			ctx.lineTo(x+r, y+h)
			ctx.arcTo(x, y+h, x, y+h-r, r)
			ctx.lineTo(x, y+r)
			ctx.arcTo(x, y, x+r, y, r)
			ctx.closePath()
			return chainable
		},
		rect: function (x, y, w, h){
			ctx.beginPath()
			ctx.moveTo(x, y)
			ctx.lineTo(x+w, y)
			ctx.lineTo(x+w, y+h)
			ctx.lineTo(x, y+h)
			ctx.closePath()
			return chainable
		},
		path: tracePath,
		circuit: function (path, offset, s){
			tracePath(path, offset, s)
			ctx.closePath()
			return chainable
		},
		colorNorm: function (r, g, b, a){
			return color255(255*r, 255*g, 255*b, a)
		},
		color255: color255,
		colorObjHSL: function (hue, sat, lit){
			function component(v){
				var x = Math.cos(6.283*v)/2 + 0.5
				return lit*(1-sat + sat*x*x)
			}
			return {
				r: component(hue),
				g: component(hue-1/3),
				b: component(hue+1/3)
			}
		},
		radialGradient: function (x, y, r1, r2, colors){
			var grad = ctx.createRadialGradient(x, y, r1, x, y, r2)
			for(var key in colors)
				if (colors.hasOwnProperty(key))
					grad.addColorStop(key, colors[key])
			return grad
		}
	}
};
;
var skanaar = skanaar || {}

skanaar.sum = function sum(list, plucker){
    var transform = {
        'undefined': _.identity,
        'string': function (obj){ return obj[plucker] },
        'number': function (obj){ return obj[plucker] },
        'function': plucker
    }[typeof plucker]
    for(var i=0, summation=0, len=list.length; i<len; i++)
        summation += transform(list[i])
    return summation
}

skanaar.hasSubstring = function hasSubstring(haystack, needle){
    if (needle === '') return true
    if (!haystack) return false
    return haystack.indexOf(needle) !== -1
}

skanaar.format = function format(template /* variadic params */){
    var parts = Array.prototype.slice.call(arguments, 1)
    return _.flatten(_.zip(template.split('#'), parts)).join('')
};
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
;
/* parser generated by jison 0.4.13 */
/*
  Returns a Parser object of the following structure:

  Parser: {
    yy: {}
  }

  Parser.prototype: {
    yy: {},
    trace: function(),
    symbols_: {associative list: name ==> number},
    terminals_: {associative list: number ==> name},
    productions_: [...],
    performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$),
    table: [...],
    defaultActions: {...},
    parseError: function(str, hash),
    parse: function(input),

    lexer: {
        EOF: 1,
        parseError: function(str, hash),
        setInput: function(input),
        input: function(),
        unput: function(str),
        more: function(),
        less: function(n),
        pastInput: function(),
        upcomingInput: function(),
        showPosition: function(),
        test_match: function(regex_match_array, rule_index),
        next: function(),
        lex: function(),
        begin: function(condition),
        popState: function(),
        _currentRules: function(),
        topState: function(),
        pushState: function(condition),

        options: {
            ranges: boolean           (optional: true ==> token location info will include a .range[] member)
            flex: boolean             (optional: true ==> flex-like lexing behaviour where the rules are tested exhaustively to find the longest match)
            backtrack_lexer: boolean  (optional: true ==> lexer regexes are tested in order and for each matching regex the action code is invoked; the lexer terminates the scan when a token is returned by the action code)
        },

        performAction: function(yy, yy_, $avoiding_name_collisions, YY_START),
        rules: [...],
        conditions: {associative list: name ==> set},
    }
  }


  token location info (@$, _$, etc.): {
    first_line: n,
    last_line: n,
    first_column: n,
    last_column: n,
    range: [start_number, end_number]       (where the numbers are indexes into the input string, regular zero-based)
  }


  the parseError function receives a 'hash' object with these members for lexer and parser errors: {
    text:        (matched text)
    token:       (the produced terminal token, if any)
    line:        (yylineno)
  }
  while parser (grammar) errors will also provide these members, i.e. parser errors deliver a superset of attributes: {
    loc:         (yylloc)
    expected:    (string describing the set of expected tokens)
    recoverable: (boolean: TRUE when the parser has a error recovery rule available for this particular error)
  }
*/
var nomnomlCoreParser = (function(){
var parser = {trace: function trace() { },
yy: {},
symbols_: {"error":2,"root":3,"compartment":4,"EOF":5,"slot":6,"IDENT":7,"class":8,"association":9,"SEP":10,"parts":11,"|":12,"[":13,"]":14,"$accept":0,"$end":1},
terminals_: {2:"error",5:"EOF",7:"IDENT",10:"SEP",12:"|",13:"[",14:"]"},
productions_: [0,[3,2],[6,1],[6,1],[6,1],[4,1],[4,3],[11,1],[11,3],[11,2],[9,3],[8,3]],
performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate /* action[1] */, $$ /* vstack */, _$ /* lstack */
/**/) {
/* this == yyval */

var $0 = $$.length - 1;
switch (yystate) {
case 1: return $$[$0-1] 
break;
case 2:this.$ = $$[$0].trim().replace(/\\(\[|\]|\|)/g, '$'+'1');
break;
case 3:this.$ = $$[$0];
break;
case 4:this.$ = $$[$0];
break;
case 5:this.$ = [$$[$0]];
break;
case 6:this.$ = $$[$0-2].concat($$[$0]);
break;
case 7:this.$ = [$$[$0]];
break;
case 8:this.$ = $$[$0-2].concat([$$[$0]]);
break;
case 9:this.$ = $$[$0-1].concat([[]]);
break;
case 10:
           var t = $$[$0-1].trim().replace(/\\(\[|\]|\|)/g, '$'+'1').match('^(.*?)([<:o+]*-/?-*[:o+>]*)(.*)$');
           this.$ = {assoc:t[2], start:$$[$0-2], end:$$[$0], startLabel:t[1].trim(), endLabel:t[3].trim()};
  
break;
case 11:
           var type = 'CLASS';
           var id = $$[$0-1][0][0];
           var typeMatch = $$[$0-1][0][0].match('<([a-z]*)>(.*)');
           if (typeMatch) {
               type = typeMatch[1].toUpperCase();
               id = typeMatch[2].trim();
           }
           $$[$0-1][0][0] = id;
           this.$ = {type:type, id:id, parts:$$[$0-1]};
  
break;
}
},
table: [{3:1,4:2,6:3,7:[1,4],8:5,9:6,13:[1,7]},{1:[3]},{5:[1,8],10:[1,9]},{5:[2,5],10:[2,5],12:[2,5],14:[2,5]},{5:[2,2],10:[2,2],12:[2,2],14:[2,2]},{5:[2,3],7:[1,10],10:[2,3],12:[2,3],14:[2,3]},{5:[2,4],10:[2,4],12:[2,4],14:[2,4]},{4:12,6:3,7:[1,4],8:5,9:6,11:11,13:[1,7]},{1:[2,1]},{6:13,7:[1,4],8:5,9:6,13:[1,7]},{8:14,13:[1,7]},{12:[1,16],14:[1,15]},{10:[1,9],12:[2,7],14:[2,7]},{5:[2,6],10:[2,6],12:[2,6],14:[2,6]},{5:[2,10],10:[2,10],12:[2,10],14:[2,10]},{5:[2,11],7:[2,11],10:[2,11],12:[2,11],14:[2,11]},{4:17,6:3,7:[1,4],8:5,9:6,12:[2,9],13:[1,7],14:[2,9]},{10:[1,9],12:[2,8],14:[2,8]}],
defaultActions: {8:[2,1]},
parseError: function parseError(str, hash) {
    if (hash.recoverable) {
        this.trace(str);
    } else {
        throw new Error(str);
    }
},
parse: function parse(input) {
    var self = this, stack = [0], vstack = [null], lstack = [], table = this.table, yytext = '', yylineno = 0, yyleng = 0, recovering = 0, TERROR = 2, EOF = 1;
    var args = lstack.slice.call(arguments, 1);
    this.lexer.setInput(input);
    this.lexer.yy = this.yy;
    this.yy.lexer = this.lexer;
    this.yy.parser = this;
    if (typeof this.lexer.yylloc == 'undefined') {
        this.lexer.yylloc = {};
    }
    var yyloc = this.lexer.yylloc;
    lstack.push(yyloc);
    var ranges = this.lexer.options && this.lexer.options.ranges;
    if (typeof this.yy.parseError === 'function') {
        this.parseError = this.yy.parseError;
    } else {
        this.parseError = Object.getPrototypeOf(this).parseError;
    }
    function popStack(n) {
        stack.length = stack.length - 2 * n;
        vstack.length = vstack.length - n;
        lstack.length = lstack.length - n;
    }
    function lex() {
        var token;
        token = self.lexer.lex() || EOF;
        if (typeof token !== 'number') {
            token = self.symbols_[token] || token;
        }
        return token;
    }
    var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;
    while (true) {
        state = stack[stack.length - 1];
        if (this.defaultActions[state]) {
            action = this.defaultActions[state];
        } else {
            if (symbol === null || typeof symbol == 'undefined') {
                symbol = lex();
            }
            action = table[state] && table[state][symbol];
        }
                    if (typeof action === 'undefined' || !action.length || !action[0]) {
                var errStr = '';
                expected = [];
                for (p in table[state]) {
                    if (this.terminals_[p] && p > TERROR) {
                        expected.push('\'' + this.terminals_[p] + '\'');
                    }
                }
                if (this.lexer.showPosition) {
                    errStr = 'Parse error on line ' + (yylineno + 1) + ':\n' + this.lexer.showPosition() + '\nExpecting ' + expected.join(', ') + ', got \'' + (this.terminals_[symbol] || symbol) + '\'';
                } else {
                    errStr = 'Parse error on line ' + (yylineno + 1) + ': Unexpected ' + (symbol == EOF ? 'end of input' : '\'' + (this.terminals_[symbol] || symbol) + '\'');
                }
                this.parseError(errStr, {
                    text: this.lexer.match,
                    token: this.terminals_[symbol] || symbol,
                    line: this.lexer.yylineno,
                    loc: yyloc,
                    expected: expected
                });
            }
        if (action[0] instanceof Array && action.length > 1) {
            throw new Error('Parse Error: multiple actions possible at state: ' + state + ', token: ' + symbol);
        }
        switch (action[0]) {
        case 1:
            stack.push(symbol);
            vstack.push(this.lexer.yytext);
            lstack.push(this.lexer.yylloc);
            stack.push(action[1]);
            symbol = null;
            if (!preErrorSymbol) {
                yyleng = this.lexer.yyleng;
                yytext = this.lexer.yytext;
                yylineno = this.lexer.yylineno;
                yyloc = this.lexer.yylloc;
                if (recovering > 0) {
                    recovering--;
                }
            } else {
                symbol = preErrorSymbol;
                preErrorSymbol = null;
            }
            break;
        case 2:
            len = this.productions_[action[1]][1];
            yyval.$ = vstack[vstack.length - len];
            yyval._$ = {
                first_line: lstack[lstack.length - (len || 1)].first_line,
                last_line: lstack[lstack.length - 1].last_line,
                first_column: lstack[lstack.length - (len || 1)].first_column,
                last_column: lstack[lstack.length - 1].last_column
            };
            if (ranges) {
                yyval._$.range = [
                    lstack[lstack.length - (len || 1)].range[0],
                    lstack[lstack.length - 1].range[1]
                ];
            }
            r = this.performAction.apply(yyval, [
                yytext,
                yyleng,
                yylineno,
                this.yy,
                action[1],
                vstack,
                lstack
            ].concat(args));
            if (typeof r !== 'undefined') {
                return r;
            }
            if (len) {
                stack = stack.slice(0, -1 * len * 2);
                vstack = vstack.slice(0, -1 * len);
                lstack = lstack.slice(0, -1 * len);
            }
            stack.push(this.productions_[action[1]][0]);
            vstack.push(yyval.$);
            lstack.push(yyval._$);
            newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
            stack.push(newState);
            break;
        case 3:
            return true;
        }
    }
    return true;
}};
/* generated by jison-lex 0.2.1 */
var lexer = (function(){
var lexer = {

EOF:1,

parseError:function parseError(str, hash) {
        if (this.yy.parser) {
            this.yy.parser.parseError(str, hash);
        } else {
            throw new Error(str);
        }
    },

// resets the lexer, sets new input
setInput:function (input) {
        this._input = input;
        this._more = this._backtrack = this.done = false;
        this.yylineno = this.yyleng = 0;
        this.yytext = this.matched = this.match = '';
        this.conditionStack = ['INITIAL'];
        this.yylloc = {
            first_line: 1,
            first_column: 0,
            last_line: 1,
            last_column: 0
        };
        if (this.options.ranges) {
            this.yylloc.range = [0,0];
        }
        this.offset = 0;
        return this;
    },

// consumes and returns one char from the input
input:function () {
        var ch = this._input[0];
        this.yytext += ch;
        this.yyleng++;
        this.offset++;
        this.match += ch;
        this.matched += ch;
        var lines = ch.match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno++;
            this.yylloc.last_line++;
        } else {
            this.yylloc.last_column++;
        }
        if (this.options.ranges) {
            this.yylloc.range[1]++;
        }

        this._input = this._input.slice(1);
        return ch;
    },

// unshifts one char (or a string) into the input
unput:function (ch) {
        var len = ch.length;
        var lines = ch.split(/(?:\r\n?|\n)/g);

        this._input = ch + this._input;
        this.yytext = this.yytext.substr(0, this.yytext.length - len - 1);
        //this.yyleng -= len;
        this.offset -= len;
        var oldLines = this.match.split(/(?:\r\n?|\n)/g);
        this.match = this.match.substr(0, this.match.length - 1);
        this.matched = this.matched.substr(0, this.matched.length - 1);

        if (lines.length - 1) {
            this.yylineno -= lines.length - 1;
        }
        var r = this.yylloc.range;

        this.yylloc = {
            first_line: this.yylloc.first_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.first_column,
            last_column: lines ?
                (lines.length === oldLines.length ? this.yylloc.first_column : 0)
                 + oldLines[oldLines.length - lines.length].length - lines[0].length :
              this.yylloc.first_column - len
        };

        if (this.options.ranges) {
            this.yylloc.range = [r[0], r[0] + this.yyleng - len];
        }
        this.yyleng = this.yytext.length;
        return this;
    },

// When called from action, caches matched text and appends it on next action
more:function () {
        this._more = true;
        return this;
    },

// When called from action, signals the lexer that this rule fails to match the input, so the next matching rule (regex) should be tested instead.
reject:function () {
        if (this.options.backtrack_lexer) {
            this._backtrack = true;
        } else {
            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).\n' + this.showPosition(), {
                text: "",
                token: null,
                line: this.yylineno
            });

        }
        return this;
    },

// retain first n characters of the match
less:function (n) {
        this.unput(this.match.slice(n));
    },

// displays already matched input, i.e. for error messages
pastInput:function () {
        var past = this.matched.substr(0, this.matched.length - this.match.length);
        return (past.length > 20 ? '...':'') + past.substr(-20).replace(/\n/g, "");
    },

// displays upcoming input, i.e. for error messages
upcomingInput:function () {
        var next = this.match;
        if (next.length < 20) {
            next += this._input.substr(0, 20-next.length);
        }
        return (next.substr(0,20) + (next.length > 20 ? '...' : '')).replace(/\n/g, "");
    },

// displays the character position where the lexing error occurred, i.e. for error messages
showPosition:function () {
        var pre = this.pastInput();
        var c = new Array(pre.length + 1).join("-");
        return pre + this.upcomingInput() + "\n" + c + "^";
    },

// test the lexed token: return FALSE when not a match, otherwise return token
test_match:function (match, indexed_rule) {
        var token,
            lines,
            backup;

        if (this.options.backtrack_lexer) {
            // save context
            backup = {
                yylineno: this.yylineno,
                yylloc: {
                    first_line: this.yylloc.first_line,
                    last_line: this.last_line,
                    first_column: this.yylloc.first_column,
                    last_column: this.yylloc.last_column
                },
                yytext: this.yytext,
                match: this.match,
                matches: this.matches,
                matched: this.matched,
                yyleng: this.yyleng,
                offset: this.offset,
                _more: this._more,
                _input: this._input,
                yy: this.yy,
                conditionStack: this.conditionStack.slice(0),
                done: this.done
            };
            if (this.options.ranges) {
                backup.yylloc.range = this.yylloc.range.slice(0);
            }
        }

        lines = match[0].match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno += lines.length;
        }
        this.yylloc = {
            first_line: this.yylloc.last_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.last_column,
            last_column: lines ?
                         lines[lines.length - 1].length - lines[lines.length - 1].match(/\r?\n?/)[0].length :
                         this.yylloc.last_column + match[0].length
        };
        this.yytext += match[0];
        this.match += match[0];
        this.matches = match;
        this.yyleng = this.yytext.length;
        if (this.options.ranges) {
            this.yylloc.range = [this.offset, this.offset += this.yyleng];
        }
        this._more = false;
        this._backtrack = false;
        this._input = this._input.slice(match[0].length);
        this.matched += match[0];
        token = this.performAction.call(this, this.yy, this, indexed_rule, this.conditionStack[this.conditionStack.length - 1]);
        if (this.done && this._input) {
            this.done = false;
        }
        if (token) {
            return token;
        } else if (this._backtrack) {
            // recover context
            for (var k in backup) {
                this[k] = backup[k];
            }
            return false; // rule action called reject() implying the next rule should be tested instead.
        }
        return false;
    },

// return next match in input
next:function () {
        if (this.done) {
            return this.EOF;
        }
        if (!this._input) {
            this.done = true;
        }

        var token,
            match,
            tempMatch,
            index;
        if (!this._more) {
            this.yytext = '';
            this.match = '';
        }
        var rules = this._currentRules();
        for (var i = 0; i < rules.length; i++) {
            tempMatch = this._input.match(this.rules[rules[i]]);
            if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
                match = tempMatch;
                index = i;
                if (this.options.backtrack_lexer) {
                    token = this.test_match(tempMatch, rules[i]);
                    if (token !== false) {
                        return token;
                    } else if (this._backtrack) {
                        match = false;
                        continue; // rule action called reject() implying a rule MISmatch.
                    } else {
                        // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
                        return false;
                    }
                } else if (!this.options.flex) {
                    break;
                }
            }
        }
        if (match) {
            token = this.test_match(match, rules[index]);
            if (token !== false) {
                return token;
            }
            // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
            return false;
        }
        if (this._input === "") {
            return this.EOF;
        } else {
            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. Unrecognized text.\n' + this.showPosition(), {
                text: "",
                token: null,
                line: this.yylineno
            });
        }
    },

// return next match that has a token
lex:function lex() {
        var r = this.next();
        if (r) {
            return r;
        } else {
            return this.lex();
        }
    },

// activates a new lexer condition state (pushes the new lexer condition state onto the condition stack)
begin:function begin(condition) {
        this.conditionStack.push(condition);
    },

// pop the previously active lexer condition state off the condition stack
popState:function popState() {
        var n = this.conditionStack.length - 1;
        if (n > 0) {
            return this.conditionStack.pop();
        } else {
            return this.conditionStack[0];
        }
    },

// produce the lexer rule set which is active for the currently active lexer condition state
_currentRules:function _currentRules() {
        if (this.conditionStack.length && this.conditionStack[this.conditionStack.length - 1]) {
            return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;
        } else {
            return this.conditions["INITIAL"].rules;
        }
    },

// return the currently active lexer condition state; when an index argument is provided it produces the N-th previous condition state, if available
topState:function topState(n) {
        n = this.conditionStack.length - 1 - Math.abs(n || 0);
        if (n >= 0) {
            return this.conditionStack[n];
        } else {
            return "INITIAL";
        }
    },

// alias for begin(condition)
pushState:function pushState(condition) {
        this.begin(condition);
    },

// return the number of states currently on the stack
stateStackSize:function stateStackSize() {
        return this.conditionStack.length;
    },
options: {},
performAction: function anonymous(yy,yy_,$avoiding_name_collisions,YY_START
/**/) {

var YYSTATE=YY_START;
switch($avoiding_name_collisions) {
case 0:return 12
break;
case 1:return 7
break;
case 2:return 13
break;
case 3:return 14
break;
case 4:return 10
break;
case 5:return 5
break;
case 6:return 'INVALID'
break;
}
},
rules: [/^(?:\s*\|\s*)/,/^(?:(\\(\[|\]|\|)|[^\]\[|;\n])+)/,/^(?:\[)/,/^(?:\s*\])/,/^(?:[ ]*(;|\n)+[ ]*)/,/^(?:$)/,/^(?:.)/],
conditions: {"INITIAL":{"rules":[0,1,2,3,4,5,6],"inclusive":true}}
};
return lexer;
})();
parser.lexer = lexer;
function Parser () {
  this.yy = {};
}
Parser.prototype = parser;parser.Parser = Parser;
return new Parser;
})();


if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
exports.parser = nomnomlCoreParser;
exports.Parser = nomnomlCoreParser.Parser;
exports.parse = function () { return nomnomlCoreParser.parse.apply(nomnomlCoreParser, arguments); };
exports.main = function commonjsMain(args) {
    if (!args[1]) {
        console.log('Usage: '+args[0]+' FILE');
        process.exit(1);
    }
    var source = require('fs').readFileSync(require('path').normalize(args[1]), "utf8");
    return exports.parser.parse(source);
};
if (typeof module !== 'undefined' && require.main === module) {
  exports.main(process.argv.slice(1));
}
};
var nomnoml = nomnoml || {}

nomnoml.parse = function (source){
	function onlyCompilables(line){
		var ok = line[0] !== '#' && line.substring(0,2) !== '//'
		return ok ? line : ''
	}
	var isDirective = function (line){ return line.text[0] === '#' }
	var lines = source.split('\n').map(function (s, i){
		return {text: s.trim(), index: i }
	})
	var pureDirectives = _.filter(lines, isDirective)
	var directives = _.object(pureDirectives.map(function (line){
		try {
			var tokens =  line.text.substring(1).split(':')
			return [tokens[0].trim(), tokens[1].trim()]
		}
		catch (e) {
			throw new Error('line ' + (line.index + 1))
		}
	}))
	var pureDiagramCode = _.map(_.pluck(lines, 'text'), onlyCompilables).join('\n').trim()
	var ast = nomnoml.transformParseIntoSyntaxTree(nomnoml.intermediateParse(pureDiagramCode))
	ast.directives = directives
	return ast
}

nomnoml.intermediateParse = function (source){
	return nomnomlCoreParser.parse(source)
}

nomnoml.transformParseIntoSyntaxTree = function (entity){

	var relationId = 0

	function transformCompartment(parts){
		var lines = []
		var rawClassifiers = []
		var relations = []
		_.each(parts, function (p){
			if (typeof p === 'string')
				lines.push(p)
			if (p.assoc){ // is a relation
				rawClassifiers.push(p.start)
				rawClassifiers.push(p.end)
				relations.push({
                    id: relationId++,
                    assoc: p.assoc,
                    start: p.start.parts[0][0],
                    end: p.end.parts[0][0],
                    startLabel: p.startLabel,
                    endLabel: p.endLabel
                })
            }
			if (p.parts){ // is a classifier
				rawClassifiers.push(p)
            }
		})
		var allClassifiers = _.map(rawClassifiers, transformItem)
		var noDuplicates = _.map(_.groupBy(allClassifiers, 'name'), function (cList){
			return _.max(cList, function (c){ return c.compartments.length })
		})

		return nomnoml.Compartment(lines, noDuplicates, relations)
	}

	function transformItem(entity){
		if (typeof entity === 'string')
			return entity
		if (_.isArray(entity))
			return transformCompartment(entity)
		if (entity.parts){
			var compartments = _.map(entity.parts, transformCompartment)
			return nomnoml.Classifier(entity.type, entity.id, compartments)
		}
		return undefined
	}

	return transformItem(entity)
};
var nomnoml = nomnoml || {}

nomnoml.Classifier = function (type, name, compartments){
	return {
        type: type,
        name: name,
        compartments: compartments
    }
}
nomnoml.Compartment = function (lines, nodes, relations){
	return {
        lines: lines,
        nodes: nodes,
        relations: relations
    }
}

nomnoml.layout = function (measurer, config, ast){
	function runDagre(input){
		return dagre.layout()
					.rankSep(config.spacing)
					.nodeSep(config.spacing)
					.edgeSep(config.spacing)
					.rankDir(config.direction)
					.run(input)
	}
	function measureLines(lines, fontWeight){
		if (!lines.length)
			return { width: 0, height: config.padding }
		measurer.setFont(config, fontWeight)
		return {
			width: Math.round(_.max(_.map(lines, measurer.textWidth)) + 2*config.padding),
			height: Math.round(measurer.textHeight() * lines.length + 2*config.padding)
		}
	}
	function layoutCompartment(c, compartmentIndex){
		var textSize = measureLines(c.lines, compartmentIndex ? 'normal' : 'bold')
		c.width = textSize.width
		c.height = textSize.height

		if (!c.nodes.length && !c.relations.length)
			return

		_.each(c.nodes, layoutClassifier)

		var g = new dagre.Digraph()
		_.each(c.nodes, function (e){
			g.addNode(e.name, { width: e.width, height: e.height })
		})
		_.each(c.relations, function (r){
			g.addEdge(r.id, r.start, r.end)
		})
		var dLayout = runDagre(g)

		var rels = _.indexBy(c.relations, 'id')
		var nodes = _.indexBy(c.nodes, 'name')
		function toPoint(o){ return {x:o.x, y:o.y} }
		dLayout.eachNode(function(u, value) {
			nodes[u].x = value.x
			nodes[u].y = value.y
		})
		dLayout.eachEdge(function(e, u, v, value) {
			var start = nodes[u], end = nodes[v]
			rels[e].path = _.map(_.flatten([start, value.points, end]), toPoint)
		})
		var graph = dLayout.graph()
		var graphHeight = graph.height ? graph.height + 2*config.gutter : 0
		var graphWidth = graph.width ? graph.width + 2*config.gutter : 0

		c.width = Math.max(textSize.width, graphWidth) + 2*config.padding
		c.height = textSize.height + graphHeight + config.padding
	}
	function layoutClassifier(clas){
		_.each(clas.compartments, layoutCompartment)
		clas.width = _.max(_.pluck(clas.compartments, 'width'))
		clas.height = skanaar.sum(clas.compartments, 'height')
		if (clas.type === 'HIDDEN'){
			clas.width = 0
			clas.height = 0
		}
		clas.x = clas.width/2
		clas.y = clas.height/2
		_.each(clas.compartments, function(co){ co.width = clas.width })
	}
	layoutCompartment(ast)
	return ast
}
;
var nomnoml = nomnoml || {}

nomnoml.render = function (graphics, config, compartment, setFont){

	var padding = config.padding
	var g = graphics
	var vm = skanaar.vector

	function renderCompartment(compartment, style, level){
		g.ctx.save()
		g.ctx.translate(padding, padding)
		g.ctx.fillStyle = config.stroke
		_.each(compartment.lines, function (text, i){
			g.ctx.textAlign = style.center ? 'center' : 'left'
			var x = style.center ? compartment.width/2 - padding : 0
			var y = (0.5+(i+0.5)*config.leading)*config.fontSize
			g.ctx.fillText(text, x, y)
			if (style.underline){
				var w = g.ctx.measureText(text).width
				y += Math.round(config.fontSize * 0.1)+0.5
				g.ctx.lineWidth = Math.round(config.fontSize/10)
				g.path([{x:x-w/2, y:y}, {x:x+w/2, y:y}]).stroke()
				g.ctx.lineWidth = config.lineWidth
			}
		})
		g.ctx.translate(config.gutter, config.gutter)
		_.each(compartment.relations, function (r){ renderRelation(r, compartment) })
		_.each(compartment.nodes, function (n){ renderNode(n, level) })
		g.ctx.restore()
	}

	function textStyle(node, line){
		if (line > 0) return {}
		return {
			CLASS: { bold: true, center: true },
			LABEL: {},
			INSTANCE: { center: true, underline: true },
			FRAME: { center: false, frameHeader: true },
			ABSTRACT: { italic: true, center: true},
			STATE: { center: true},
			DATABASE: { bold: true, center: true},
			NOTE: {},
			ACTOR: {},
			USECASE: { center: true },
			START: { empty: true },
			END: { empty: true },
			INPUT: { center: true },
			CHOICE: { center: true },
			SENDER: {},
			RECEIVER: {},
			HIDDEN: { empty: true },
		}[node.type] || {}
	}

	function renderNode(node, level){
		var x = Math.round(node.x-node.width/2)
		var y = Math.round(node.y-node.height/2)
		var xCenter = x + node.width/2
		var shade = config.fill[level] || _.last(config.fill)
		g.ctx.fillStyle = shade
		if (node.type === 'NOTE'){
			g.circuit([
				{x: x, y: y},
				{x: x+node.width-padding, y: y},
				{x: x+node.width, y: y+padding},
				{x: x+node.width, y: y+node.height},
				{x: x, y: y+node.height},
				{x: x, y: y}
			]).fill().stroke()
			g.path([
				{x: x+node.width-padding, y: y},
				{x: x+node.width-padding, y: y+padding},
				{x: x+node.width, y: y+padding}
			]).stroke()
		} else if (node.type === 'ACTOR') {
			var a = padding/2
			var yp = y + a/2
			var actorCenter = {x: xCenter, y: yp-a}
			g.circle(actorCenter, a).fill().stroke()
			g.path([ {x: xCenter,   y: yp},
				     {x: xCenter,   y: yp+2*a} ]).stroke()
			g.path([ {x: xCenter-a, y: yp+a},
				     {x: xCenter+a, y: yp+a} ]).stroke()
			g.path([ {x: xCenter-a, y: yp+a+padding},
				     {x: xCenter  , y: yp+padding},
				     {x: xCenter+a, y: yp+a+padding} ]).stroke()
		} else if (node.type === 'USECASE') {
			var center = {x: xCenter, y: y+node.height/2}
			g.ellipse(center, node.width, node.height).fill().stroke()
		} else if (node.type === 'START') {
			g.ctx.fillStyle = config.stroke
			g.circle(xCenter, y+node.height/2, node.height/2.5).fill()
		} else if (node.type === 'END') {
			g.circle(xCenter, y+node.height/2, node.height/3).fill().stroke()
			g.ctx.fillStyle = config.stroke
			g.circle(xCenter, y+node.height/2, node.height/3-padding/2).fill()
		} else if (node.type === 'STATE') {
			var stateRadius = Math.min(padding*2*config.leading, node.height/2)
			g.roundRect(x, y, node.width, node.height, stateRadius).fill().stroke()
		} else if (node.type === 'INPUT') {
			g.circuit([
				{x:x+padding, y:y},
				{x:x+node.width, y:y},
				{x:x+node.width-padding, y:y+node.height},
				{x:x, y:y+node.height}
			]).fill().stroke()
		} else if (node.type === 'CHOICE') {
			g.circuit([
				{x:node.x, y:y - padding},
				{x:x+node.width + padding, y:node.y},
				{x:node.x, y:y+node.height + padding},
				{x:x - padding, y:node.y}
			]).fill().stroke()
		} else if (node.type === 'PACKAGE') {
			var headHeight = node.compartments[0].height
			g.rect(x, y+headHeight, node.width, node.height-headHeight).fill().stroke()
			var w = g.ctx.measureText(node.name).width + 2*padding
			g.circuit([
				{x:x, y:y+headHeight},
				{x:x, y:y},
				{x:x+w, y:y},
				{x:x+w, y:y+headHeight}
		    ]).fill().stroke()
		} else if (node.type === 'SENDER') {
			g.circuit([
				{x: x, y: y},
				{x: x+node.width-padding, y: y},
				{x: x+node.width+padding, y: y+node.height/2},
				{x: x+node.width-padding, y: y+node.height},
				{x: x, y: y+node.height}
			]).fill().stroke()
		} else if (node.type === 'RECEIVER') {
			g.circuit([
				{x: x, y: y},
				{x: x+node.width+padding, y: y},
				{x: x+node.width-padding, y: y+node.height/2},
				{x: x+node.width+padding, y: y+node.height},
				{x: x, y: y+node.height}
			]).fill().stroke()
		} else if (node.type === 'HIDDEN') {
		} else if (node.type === 'DATABASE') {
			var cx = xCenter
			var cy = y-padding/2
			var pi = 3.1416
			g.rect(x, y, node.width, node.height).fill()
			g.path([{x: x, y: cy}, {x: x, y: cy+node.height}]).stroke()
			g.path([
				{x: x+node.width, y: cy},
				{x: x+node.width, y: cy+node.height}]).stroke()
			g.ellipse({x: cx, y: cy}, node.width, padding*1.5).fill().stroke()
			g.ellipse({x: cx, y: cy+node.height}, node.width, padding*1.5, 0, pi)
				.fill().stroke()
		} else if (node.type === 'LABEL') {
		} else {
			g.rect(x, y, node.width, node.height).fill().stroke()
		}
		var yDivider = (node.type === 'ACTOR' ? y + padding*3/4 : y)
		_.each(node.compartments, function (part, i){
			var s = textStyle(node, i)
			if (s.empty) return
			g.ctx.save()
			g.ctx.translate(x, yDivider)
			setFont(config, s.bold ? 'bold' : 'normal', s.italic)
			renderCompartment(part, s, level+1)
			g.ctx.restore()
			if (i+1 === node.compartments.length) return
			yDivider += part.height
			if (node.type === 'FRAME' && i === 0){
				var w = g.ctx.measureText(node.name).width+part.height/2+padding
				g.path([
					{x:x, y:yDivider},
					{x:x+w-part.height/2, y:yDivider},
					{x:x+w, y:yDivider-part.height/2},
					{x:x+w, y:yDivider-part.height}
			    ]).stroke()
			} else
				g.path([{x:x, y:yDivider}, {x:x+node.width, y:yDivider}]).stroke()
		})
	}

	function strokePath(p){
		if (config.edges === 'rounded'){
			var radius = config.spacing * config.bendSize
	        g.ctx.beginPath()
	        g.ctx.moveTo(p[0].x, p[0].y)
			for (var i = 1; i < p.length-1; i++){
				var vec = vm.diff(p[i], p[i-1])
				var bendStart = vm.add(p[i-1], vm.mult(vm.normalize(vec), vm.mag(vec)-radius))
				g.ctx.lineTo(bendStart.x, bendStart.y)
				g.ctx.arcTo(p[i].x, p[i].y, p[i+1].x, p[i+1].y, radius)
			}
			g.ctx.lineTo(_.last(p).x, _.last(p).y)
	        g.ctx.stroke()
		}
		else
			g.path(p).stroke()
	}

	var empty = false, filled = true, diamond = true

	function renderRelation(r, compartment){
		var startNode = _.findWhere(compartment.nodes, {name:r.start})
		var endNode = _.findWhere(compartment.nodes, {name:r.end})

		var start = rectIntersection(r.path[1], _.first(r.path), startNode)
		var end = rectIntersection(r.path[r.path.length-2], _.last(r.path), endNode)

		var path = _.flatten([start, _.tail(_.initial(r.path)), end])
		var fontSize = config.fontSize

		g.ctx.fillStyle = config.stroke
		setFont(config, 'normal')
		var textW = g.ctx.measureText(r.endLabel).width
		var labelX = config.direction === 'LR' ? -padding-textW : padding
		g.ctx.fillText(r.startLabel, start.x+padding, start.y+padding+fontSize)
		g.ctx.fillText(r.endLabel, end.x+labelX, end.y-padding)

		if (r.assoc !== '-/-'){
			if (g.ctx.setLineDash && skanaar.hasSubstring(r.assoc, '--')){
				var dash = Math.max(4, 2*config.lineWidth)
				g.ctx.setLineDash([dash, dash])
				strokePath(path)
				g.ctx.setLineDash([])
			}
			else
				strokePath(path)
		}

		function drawArrowEnd(id, path, end){
			if (id === '>' || id === '<')
				drawArrow(path, filled, end)
			else if (id === ':>' || id === '<:')
				drawArrow(path, empty, end)
			else if (id === '+')
				drawArrow(path, filled, end, diamond)
			else if (id === 'o')
				drawArrow(path, empty, end, diamond)
		}

		var tokens = r.assoc.split('-')
		drawArrowEnd(_.last(tokens), path, end)
		drawArrowEnd(_.first(tokens), path.reverse(), start)
	}

	function rectIntersection(p1, p2, rect){
		if(rect.width === 0 && rect.height === 0) return p2
		var v = vm.diff(p1, p2)
		for(var t=1; t>=0; t-= 0.01){
			var p = vm.mult(v, t)
			if(Math.abs(p.x) <= rect.width/2+config.edgeMargin &&
				Math.abs(p.y) <= rect.height/2+config.edgeMargin)
				return vm.add(p2, p)
		}
		return p2
	}

	function drawArrow(path, isOpen, arrowPoint, diamond){
		var size = (config.spacing - 2*config.edgeMargin) * config.arrowSize / 30
		var v = vm.diff(path[path.length-2], _.last(path))
		var nv = vm.normalize(v)
		function getArrowBase(s){ return vm.add(arrowPoint, vm.mult(nv, s*size)) }
		var arrowBase = getArrowBase(diamond ? 7 : 10)
		var t = vm.rot(nv)
		var arrowButt = (diamond) ? getArrowBase(14)
				: (isOpen && !config.fillArrows) ? getArrowBase(5) : arrowBase
		var arrow = [
			vm.add(arrowBase, vm.mult(t, 4*size)),
			arrowButt,
			vm.add(arrowBase, vm.mult(t, -4*size)),
			arrowPoint
		]
		g.ctx.fillStyle = isOpen ? config.stroke : config.fill[0]
		g.circuit(arrow).fill().stroke()
	}

	function snapToPixels(){
		if (config.lineWidth % 2 === 1)
			g.ctx.translate(0.5, 0.5)
	}

	g.clear()
	setFont(config, 'bold')
	g.ctx.save()
	g.ctx.lineWidth = config.lineWidth
	g.ctx.lineJoin = 'round'
	g.ctx.lineCap = 'round'
	g.ctx.strokeStyle = config.stroke
	g.ctx.scale(config.zoom, config.zoom)
	snapToPixels()
	renderCompartment(compartment, {}, 0)
	g.ctx.restore()
}
;
var nomnoml = nomnoml || {};

(function () {
	'use strict';

	function getConfig(d) {
		return {
			arrowSize: +d.arrowSize || 1,
			bendSize: +d.bendSize || 0.3,
			direction: { down: 'TB', right: 'LR' }[d.direction] || 'TB',
			gutter: +d.gutter || 5,
			edgeMargin: (+d.edgeMargin) || 0,
			edges: { hard: 'hard', rounded: 'rounded' }[d.edges] || 'rounded',
			fill: (d.fill || '#eee8d5;#fdf6e3;#eee8d5;#fdf6e3').split(';'),
			fillArrows: d.fillArrows === 'true',
			font: d.font || 'Calibri',
			fontSize: (+d.fontSize) || 12,
			leading: (+d.leading) || 1.25,
			lineWidth: (+d.lineWidth) || 3,
			padding: (+d.padding) || 8,
			spacing: (+d.spacing) || 40,
			stroke: d.stroke || '#33322E',
			title: d.title || 'nomnoml',
			zoom: +d.zoom || 1
		};
	}

	function fitCanvasSize(canvas, rect, zoom) {
		canvas.width = rect.width * zoom;
		canvas.height = rect.height * zoom;
	}

	function setFont(config, isBold, isItalic, graphics) {
		var style = (isBold === 'bold' ? 'bold' : '')
		if (isItalic) style = 'italic' + style
		var defaultFont = 'Helvetica, sans-serif'
		var font = skanaar.format('# #pt #, #', style, config.fontSize, config.font, defaultFont)
		graphics.ctx.font = font
	}

	function parseAndRender(code, graphics, canvas, scale) {
		var ast = nomnoml.parse(code);
		var config = getConfig(ast.directives);
		var measurer = {
			setFont: function (a, b, c) { setFont(a, b, c, graphics); },
			textWidth: function (s) { return graphics.ctx.measureText(s).width },
			textHeight: function () { return config.leading * config.fontSize }
		};
		var layout = nomnoml.layout(measurer, config, ast);
		fitCanvasSize(canvas, layout, config.zoom * scale);
		config.zoom *= scale;
		nomnoml.render(graphics, config, layout, measurer.setFont);
		return { config: config };
	}

	nomnoml.draw = function (canvas, code, scale) {
		var skCanvas = skanaar.Canvas(canvas)
		return parseAndRender(code, skCanvas, canvas, scale || 1)
	};
})();
;
  /*{{body}}*/;
  var dagre; // Enable usage with require.js and outside of the browser
  if (typeof dagre === 'undefined') {
    dagre = self.dagre;
  }
  return nomnoml;
});