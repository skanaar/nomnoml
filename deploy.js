var AWS = require('aws-sdk')
var fs = require('fs')

AWS.config.update({
  accessKeyId: process.env.AWS_KEY,
  secretAccessKey: process.env.AWS_SECRET
})

var files = [
  'index.html',
  'nomnoml.css',
  'dist/nomnoml.web.js',
  'dist/webapp.js',
  'lib/dagre.min.js',
  'lib/filesaver.min.js',
  'lib/underscore.min.js',
  'codemirror/codemirror-compressed.js',
  'codemirror/codemirror.css',
  'codemirror/nomnoml.codemirror-mode.js',
  'codemirror/solarized.nomnoml.css',
  'img/interaction-tutorial.svg',
  // test files
  'dist/nomnoml.js',
  'test/index.html',
  'test/nomnoml.spec.js',
  'test/output.node-test.svg',
  'test/skanaar.testsuite.js',
  'test/standalone.usecase.html',
  // additionals
  'additionals.js',
]

var contentTypes = {
  js: 'application/javascript',
  css: 'text/css',
  html: 'text/html',
  svg: 'image/svg+xml',
}

var subfolder = process.argv[2]
subfolder = subfolder ? (subfolder + '/') : ''

function contentType(file){ return contentTypes[file.split('.').slice(-1)[0]] }

files.forEach(function (file){
  var base64data = Buffer.from(fs.readFileSync(file), 'binary')

  var s3 = new AWS.S3()
  s3.putObject({
    Bucket: 'www.nomnoml.com',
    Key: subfolder + file,
    Body: base64data,
    ContentType: contentType(file),
    ACL: 'public-read'
  }, function (resp) {
    console.log('  uploaded ' + file)
  })
})
