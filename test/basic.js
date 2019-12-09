var test = require('tape')
var HLSServer = require('./../src/index')
var http = require('http')
var httpAttach = require('http-attach')
var request = require('request')

var PORT = 8000
var hls

test('constructor without http server', function (t) {
  t.plan(1)

  hls = new HLSServer(PORT, {
    debugPlayer: true
  })
  t.ok(hls)
})

test('constructor with http server', function (t) {
  t.plan(2)

  var httpServer = http.createServer()
  var hls2 = new HLSServer(httpServer)
  httpServer.listen(9081)
  t.ok(hls2, 'Server not null')

  request({
    url: 'http://127.0.0.1:9081/test/files/output/out.m3u8'
  }, function (error, response, body) {
    if (error) t.fail('Manifest failed with error ' + error)
    if (response.statusCode !== 200) t.fail('Wrong status code ' + response.statusCode)
    console.log(response.statusCode)
    console.log(body)
    t.pass('Manifest fetched.')
  })
})

test('constructor with http server (CORS)', function (t) {
  t.plan(2)

  var httpServer = http.createServer()
  function addCors (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', req.header.origin)
    res.setHeader('Access-Control-Request-Method', req.header.origin)
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET')
    res.setHeader('Access-Control-Allow-Headers', req.header.origin)
    if (req.method === 'OPTIONS') {
      res.writeHead(200)
      res.end()
      return
    }
    next()
  }
  httpAttach(httpServer, addCors)
  var hls2 = new HLSServer(httpServer, {

  })
  httpServer.listen(9082)
  t.ok(hls2, 'Server not null.')

  request({
    url: 'http://127.0.0.1:9082/test/files/output/out.m3u8',
    headers: {
      origin: 'http://NOTTHERIGHTORIGIN.example'
    }
  }, function (error, response, body) {
    if (error) t.fail('Manifest failed with error ' + error)
    if (response.statusCode !== 200) t.fail('Wrong status code ' + response.statusCode)
    console.log(response.statusCode)
    console.log(body)
    t.pass('Manifest fetched.')
  })
})

test('SUMMARY', function (t) {
  t.end()
  process.exit(0)
})
