(function (){
    function randomName(syllables){
        var vowel = 'aaeeiioouuy'
        var conso = 'bcddfghhkllmnnprrsstttv'
        function syllable(){ return _.sample(vowel) + _.sample(conso) }
        return _.sample(conso).toUpperCase() + 
                _.times(syllables || _.random(2,4), syllable).join('')
    }
    function sum(list, plucker){
        var transform = {
            'undefined': _.identity,
            'string': function (obj){ return obj[plucker] },
            'number': function (obj){ return obj[plucker] },
            'function': plucker
        }[typeof plucker]
        for(var i=0, sum=0, len=list.length; i<len; i++)
            sum += transform(list[i])
        return sum
    }
    function average(list, plucker){
        return sum(list, plucker) / list.length
    }
    function trim(str){
        return str.trim()
    }
    function hasSubstring(haystack, needle){
        if (needle === '') return true
        if (haystack == null) return false
        return haystack.indexOf(needle) !== -1
    }
    _.mixin({
        sum: sum,
        average: average,
        randomName: randomName,
        trim: trim,
        hasSubstring: hasSubstring
    })
}())