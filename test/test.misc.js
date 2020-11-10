var nomnoml = require('../dist/nomnoml.js')
var TestSuite = require('./TestSuite.js')

var suite = TestSuite('Misc')
var assertEqual = TestSuite.assertEqual
var assert = TestSuite.assert

suite.node_test('assert library version', function () {
    var fs = require('fs')
    var library = require('../dist/nomnoml.js')
    var package = require('../package.json')
    var changelog = fs.readFileSync('changelog.md', { encoding: 'utf-8' })
    var versionMatch = changelog.match(/\d+\.\d+\.\d+/)
    var logVersion = versionMatch && versionMatch[0]
    if (library.version != package.version) {
        throw new Error('version of distribution bundle and npm package must match')
    }
    var isProductionVersion = !library.version.includes('-')
    if (isProductionVersion && library.version != logVersion) {
        throw new Error('production versions must be documented in changelog')
    }
})

suite.test('skanaar.testsuite.isEqual', function(){
    test(TestSuite.isEqual([1,2], [1,2]))
    test(!TestSuite.isEqual([2,1], [1,2]))
    test(TestSuite.isEqual({b:4, a:'asdf'}, {a:'asdf', b:4}))
    test(!TestSuite.isEqual({b:4, a:'asdf'}, {a:'asdf'}))
    test(!TestSuite.isEqual({a:'asdf'}, {a:'asdf', b:4}))
    
    function test(condition) {
        if (!condition) throw new Error('testsuite failure')
    }
})

suite.test('skanaar.testsuite.assert', function(){
    TestSuite.assert([1,2], '=', [1,2])
    TestSuite.assertThrows(() => TestSuite.assert([1,2], '=', [17]))
    TestSuite.assert(4, '<', 5)
    TestSuite.assertThrows(() => TestSuite.assert(5, '<', 4))
    TestSuite.assert(6, '>', 5)
    TestSuite.assertThrows(() => TestSuite.assert(3, '>', 4))
    TestSuite.assertThrows(() => TestSuite.assert(true))
})

suite.test('util range', function () {
    assertEqual(nomnoml.skanaar.range([0, 1], 5), [0, 0.25, 0.5, 0.75, 1])
})
suite.test('util sum', function () {
    assertEqual(nomnoml.skanaar.sum([[0], [4], [17]], e => e[0]), 21)
    assertEqual(nomnoml.skanaar.sum([[0], [4], [17]], e => e[0]), 21)
})
suite.test('util find', function () {
    assertEqual(nomnoml.skanaar.find([{a:0}, {a:4, needle: true}, {a:17}], e => e.a == 4), { a:4, needle: true })
})
suite.test('util last', function () {
    assertEqual(nomnoml.skanaar.last([{a:0}, {a:4}, {a:17, needle: true}]), { a:17, needle: true })
})
suite.test('util hasSubstring', function () {
    assert(nomnoml.skanaar.hasSubstring("xyz abc", 'xyz'), '=', true)
    assert(nomnoml.skanaar.hasSubstring("1 xyz 0", 'xyz'), '=', true)
    assert(nomnoml.skanaar.hasSubstring("abc xyz", 'xyz'), '=', true)
})
suite.test('util merged', function () {
    assertEqual(nomnoml.skanaar.merged({a:4, b: 'x'}, {a:17, c: true}), { a:17, b: 'x', c: true })
})
suite.test('util indexBy', function(){
    assertEqual(nomnoml.skanaar.indexBy([], 'name'), {})
    assertEqual(nomnoml.skanaar.indexBy([{name:'apa'}], 'name'), {apa:{name:'apa'}})
})
suite.test('util uniqueBy', function () {
    assertEqual(nomnoml.skanaar.uniqueBy([{a:4, b:'x'}, {a:17, c:'y'}, { a:4, d:'z' }], 'a'), [{ a:4, b:'x' }, {a:17, c:'y'}])
})

suite.test('processImports resolves shallow imports', function(){
    var mockFiles = {
        importsOneFile: '#import: file1',
        importsTwoFiles: '#import: file1\n#import: file2',
        file1: 'file1-contents',
        file2: 'file2-contents'
    }
    var loadFile = (key) => mockFiles[key]
    var output = nomnoml.processImports(mockFiles['importsOneFile'], loadFile)
    assertEqual(output, 'file1-contents')
    output = nomnoml.processImports(mockFiles['importsTwoFiles'], loadFile)
    assertEqual(output, 'file1-contents\nfile2-contents')
})

suite.test('processImports ignores bad imports', function(){
    var out = nomnoml.processImports('#import: root', (key) => { throw new Error('filesystem bug') })
    assertEqual(out, '')
})

suite.test('processImports throw on recursive imports', function(){
    TestSuite.assertThrows(() => nomnoml.processImports('#import: root', (key) => '#import: root'))
})

suite.test('processImports resolves deep imports', function(){
    var mockFiles = {
        root: `
A
#import: file1
B
#import: file2
C`,
        file1: `
X
#import: file3
Y`,
        file2: 'Q',
        file3: 'W'
    }
    var output = nomnoml.processImports(mockFiles['root'], (key) => mockFiles[key])
    assertEqual(output, `
A

X
W
Y
B
Q
C`)
})

suite.test('escape [data-name] attribute value in SVG', function() {
    var output = nomnoml.renderSvg('[&]-[<]')
    assert(output, 'includes', 'data-name="&amp;"')
})

suite.report()
