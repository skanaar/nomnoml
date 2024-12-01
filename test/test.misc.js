var {
  skanaar,
  processImports,
  processAsyncImports,
  ImportDepthError,
  renderSvg,
} = require('../dist/nomnoml.js')
var { test } = require('node:test')
var { assert } = require('./assert.js')
var { join } = require('node:path')

test('assert library version', function () {
  var fs = require('fs')
  var library = require('../dist/nomnoml.js')
  var package = require('../package.json')
  var lockfile = require('../package-lock.json')
  var changelog = fs.readFileSync(join(__dirname, '../changelog.md'), { encoding: 'utf-8' })
  var versionMatch = changelog.match(/\d+\.\d+\.\d+/)
  var logVersion = versionMatch && versionMatch[0]
  if (library.version != package.version) {
    throw new Error('version of distribution bundle and npm package must match')
  }
  if (lockfile.version != package.version) {
    throw new Error('version of package-lock and npm package must match')
  }
  var isProductionVersion = !library.version.includes('-')
  if (isProductionVersion && library.version != logVersion) {
    throw new Error('production versions must be documented in changelog')
  }
})

test('skanaar.testsuite.isEqual', function () {
  assert([1, 2], '=', [1, 2])
  assert({ b: 4, a: 'asdf' }, '=', { a: 'asdf', b: 4 })
})

test('skanaar.testsuite.assert', function () {
  assert([1, 2], '=', [1, 2])
  assert(() => assert([1, 2], '=', [17]), 'throws', Error)
  assert(4, '<', 5)
  assert(() => assert(5, '<', 4), 'throws', Error)
  assert(6, '>', 5)
  assert(() => assert(3, '>', 4), 'throws', Error)
  assert(() => assert(true), 'throws', Error)
})

test('util range', function () {
  assert(skanaar.range([0, 1], 5), '=', [0, 0.25, 0.5, 0.75, 1])
})
test('util sum', function () {
  assert(
    skanaar.sum([[0], [4], [17]], (e) => e[0]),
    '=',
    21
  )
  assert(
    skanaar.sum([[0], [4], [17]], (e) => e[0]),
    '=',
    21
  )
})
test('util last', function () {
  assert(skanaar.last([{ a: 0 }, { a: 4 }, { a: 17, needle: true }]), '=', { a: 17, needle: true })
})
test('util indexBy', function () {
  assert(skanaar.indexBy([], 'name'), '=', {})
  assert(skanaar.indexBy([{ name: 'apa' }], 'name'), '=', { apa: { name: 'apa' } })
})

test('processImports resolves shallow imports', function () {
  var mockFiles = {
    importsOneFile: '#import: file1',
    importsTwoFiles: '#import: file1\n#import: file2',
    file1: 'file1-contents',
    file2: 'file2-contents',
  }
  var loadFile = (key) => mockFiles[key]
  var output = processImports(mockFiles['importsOneFile'], loadFile)
  assert(output, '=', 'file1-contents')
  output = processImports(mockFiles['importsTwoFiles'], loadFile)
  assert(output, '=', 'file1-contents\nfile2-contents')
})

test('processImports ignores bad imports', function () {
  var out = processImports('#import: root', (key) => {
    throw new Error('filesystem bug')
  })
  assert(out, '=', '')
})

test('processImports throw on recursive imports', function () {
  assert(
    () => processImports('#import: root', (key) => '#import: root'),
    'throws',
    ImportDepthError
  )
})

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
  file3: 'W',
}

var mockResult = `
A

X
W
Y
B
Q
C`

test('processImports resolves deep imports', function () {
  var output = processImports(mockFiles['root'], (key) => mockFiles[key])
  assert(output, '=', mockResult)
})

test('processAsyncImports resolves deep imports', async function () {
  var delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
  var output = await processAsyncImports(mockFiles['root'], (key) =>
    delay(1).then(() => mockFiles[key])
  )
  assert(output, '=', mockResult)
})

test('processAsyncImports via file system', async function () {
  var fs = require('fs')
  var output = await processAsyncImports(
    fs.readFileSync(join(__dirname, 'import-test.nomnoml'), 'utf-8'),
    (key) => fs.promises.readFile('test/' + key, 'utf-8')
  )
  fs.writeFileSync(join(__dirname, 'output.async.nomnoml'), output)
})

test('escape [data-name] attribute value in SVG', function () {
  var output = renderSvg('[&]-[a]')
  assert(output, 'includes', 'data-name="&amp;"')
})

test('SVG export includes nomnoml source in <desc>', function () {
  var output = renderSvg('[a]->[b]')
  var desc = output.match('<desc ?>(.*)</desc>')[1]
  assert(desc.trim(), '=', '[a]-&gt;[b]')
})
