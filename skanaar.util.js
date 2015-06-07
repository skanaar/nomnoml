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
}