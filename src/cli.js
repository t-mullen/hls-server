#!/usr/bin/env node

var HLSServer = require('./index')
var http = require('http')
var argv = require('minimist')(process.argv.slice(2))
var cluster = require('cluster')
var numCPUs = require('os').cpus().length

if (cluster.isMaster) {
  masterProcess()
} else {
  childProcess()
}

function masterProcess () {
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

  var workers = []
  for (let i = 0; i < numCPUs; i++) {
    var worker = cluster.fork()
    workers.push(worker)
    worker.send({
      port: port,
      dir: dir,
      path: path
    })
  }

  console.log('HLS server starting on port', port)
}

function childProcess () {
  process.on('message', (msg) => {
    var server = http.createServer()
    HLSServer(server, {
      path: msg.path,
      dir: msg.dir
    })
    server.listen(msg.port)

    console.log(`Worker ${process.pid} running...`)
  })
}
