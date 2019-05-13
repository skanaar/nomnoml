namespace nomnoml.skanaar {
    export function plucker<T>(pluckerDef: any): (e:any) => any {
        switch (typeof pluckerDef) {
            case 'undefined': return function(e: any): T { return e }
            case 'string': return function (obj: any){ return obj[pluckerDef] }
            case 'number': return function (obj: any){ return obj[pluckerDef] }
            case 'function': return pluckerDef
        }
    }
    export function max(list: any[], plucker?: any): number {
        var transform = skanaar.plucker(plucker)
        var maximum = transform(list[0])
        for(var i=0; i<list.length; i++) {
            var item = transform(list[i])
            maximum = (item > maximum) ? item : maximum 
        }
        return maximum
    }
    export function sum<T>(list: { length: number, [i: number]: T }, plucker?: any){
        var transform = skanaar.plucker(plucker)
        for(var i=0, summation=0, len=list.length; i<len; i++)
            summation += transform(list[i])
        return summation
    }
    export function flatten<T>(lists: T[][]): T[]{
        var out: T[] = []
        for(var i=0; i<lists.length; i++)
            out = out.concat(lists[i])
        return out
    }
    export function find<T>(list: T[], predicate: (e:T)=>boolean){
        for(var i=0; i<list.length; i++)
            if (predicate(list[i]))
                return list[i]
        return undefined
    }
    export function last<T>(list: T[]){
        return list[list.length-1]
    }
    export function hasSubstring(haystack: string, needle: string){
        if (needle === '') return true
        if (!haystack) return false
        return haystack.indexOf(needle) !== -1
    }
    export function format(template: string, ...parts: any[]){
        var matrix = template.split('#')
        var output = [matrix[0]]
        for (var i=0; i<matrix.length-1; i++) {
            output.push(parts[i] || '')
            output.push(matrix[i+1])
        }
        return output.join('')
    }
    export function merged(a: any, b: any) {
        function assign(target: any, data: any) {
            for(var key in data)
                target[key] = data[key]
        }
        var obj = {}
        assign(obj, a)
        assign(obj, b)
        return obj
    }
    export function indexBy<T>(list: T[], key: keyof T): { [key:string]: T } {
        var obj: { [key:string]: T } = {}
        for(var i=0; i<list.length; i++)
            obj[list[i][key] as any] = list[i]
        return obj
    }
    export function uniqueBy<T>(list: T[], pluckerDef: string): T[] {
        var seen: { [key:string]:boolean } = {}
        var getKey = skanaar.plucker(pluckerDef)
        var out: T[] = []
        for(var i=0; i<list.length; i++) {
            var key = getKey(list[i])
            if (!seen[key]){
                seen[key] = true
                out.push(list[i])
            }
        }
        return out
    }
}