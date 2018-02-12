var test = require('tape')
var HLSServer = require('./../src/index')
var http = require('http')
var ffmpeg = require('fluent-ffmpeg')
var httpAttach = require('http-attach')
var request = require('request')

var PORT = 8000
var hls

var ffmpegHLS = function (inputPath, outputPath, cb) {
  return ffmpeg(inputPath, { timeout: 432000 }).addOptions([
    '-profile:v baseline',
    '-level 3.0',
    '-s 640x360',
    '-start_number 0',
    '-hls_time 10',
    '-hls_list_size 0',
    '-f hls'
  ]).output(outputPath).on('end', cb).run()
}

test('ffmpeg', function (t) {
  t.plan(2)

  ffmpegHLS('test/files/out.mp4', 'test/files/output/out.m3u8', function () {
    t.pass('mp4 done')
  })
  ffmpegHLS('test/files/out2.webm', 'test/files/output/out2.m3u8', function () {
    t.pass('webm done')
  })
})

test('constructor without http server', function (t) {
  t.plan(1)

  hls = new HLSServer(PORT, {
    debugPlayer: true
  })
  t.ok(hls)
})

test('constructor with http server', function (t) {
  t.plan(1)

  var httpServer = http.createServer()
  var hls2 = new HLSServer(httpServer)
  httpServer.listen(9081)
  t.ok(hls2, 'Server not null')

  request({
    url: 'http://127.0.0.1:9082/test/files/output/out.m3u8'
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
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Request-Method', '*')
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET')
    res.setHeader('Access-Control-Allow-Headers', '*')
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
      Origin: 'http://NOTTHERIGHTORIGIN.example'
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
