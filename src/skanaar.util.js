var skanaar = skanaar || {}

skanaar.plucker = function (pluckerDef){
    return {
        'undefined': function(e){ return e },
        'string': function (obj){ return obj[pluckerDef] },
        'number': function (obj){ return obj[pluckerDef] },
        'function': pluckerDef
    }[typeof pluckerDef]
}

skanaar.max = function (list, plucker){
    var transform = skanaar.plucker(plucker)
    var maximum = transform(list[0])
    for(var i=0; i<list.length; i++) {
        var item = transform(list[i])
        maximum = (item > maximum) ? item : maximum 
    }
    return maximum
}

skanaar.sum = function (list, plucker){
    var transform = skanaar.plucker(plucker)
    for(var i=0, summation=0, len=list.length; i<len; i++)
        summation += transform(list[i])
    return summation
}

skanaar.flatten = function (lists){
    var out = []
    for(var i=0; i<lists.length; i++)
        out = out.concat(lists[i])
    return out
}

skanaar.find = function (list, predicate){
    for(var i=0; i<list.length; i++)
        if (predicate(list[i]))
            return list[i]
    return undefined
}

skanaar.last = function (list){
    return list[list.length-1]
}

skanaar.hasSubstring = function hasSubstring(haystack, needle){
    if (needle === '') return true
    if (!haystack) return false
    return haystack.indexOf(needle) !== -1
}

skanaar.format = function format(template /* variadic params */){
    var parts = Array.prototype.slice.call(arguments, 1)
    var matrix = template.split('#')
    var output = [matrix[0]]
    for (var i=0; i<matrix.length-1; i++) {
        output.push(parts[i] || '')
        output.push(matrix[i+1])
    }
    return output.join('')
}

skanaar.merged = function (a, b) {
    function assign(target, data) {
        for(var key in data)
            target[key] = data[key]
    }
    var obj = {}
    assign(obj, a)
    assign(obj, b)
    return obj
}

skanaar.indexBy = function (list, key) {
    var obj = {}
    for(var i=0; i<list.length; i++)
        obj[list[i][key]] = list[i]
    return obj
}

skanaar.uniqueBy = function (list, pluckerDef) {
    var seen = {}
    var getKey = skanaar.plucker(pluckerDef)
    var out = []
    for(var i=0; i<list.length; i++) {
        var key = getKey(list[i])
        if (!seen[key]){
            seen[key] = true
            out.push(list[i])
        }
    }
    return out
}
