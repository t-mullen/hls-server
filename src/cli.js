var HLSServer = require('./index')
var http = require('http')
var argv = require('minimist')(process.argv.slice(2))

if (argv['v'] || argv['version']) {
  console.log(require('../package.json').version)
  process.exit(0)
}

function printHelp () {
  console.log('hlsserver - Quick and simple HLS video streaming server.')
  console.log('')
  console.log('Usage:')
  console.log('  hlsserver --port <port> --dir <directory> --path <path>  Run an HLS server.')
  console.log('  hlsserver --version | -v                                 Show package version.')
  console.log('')
  process.exit(0)
}

if (argv['help']) {
  printHelp()
}

var port = argv['port'] || argv['p'] || 8000
var dir = argv['dir'] || argv['d'] || ''
var path = argv['path'] || argv['url'] || argv['u'] || '/'

var server = http.createServer()
HLSServer(server, {
  path: path,     // Base URI to output HLS streams
  dir: dir  // Directory that input files are stored
})
console.log('HLS server running on port', port)
server.listen(port)
