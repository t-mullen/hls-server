var test = require('tape')
var HLSServer = require('./../src/index')
var http = require('http')
var ffmpeg = require('fluent-ffmpeg')

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
  httpServer.listen()
  t.ok(hls2)
})

test('SUMMARY', function (t) {
  t.end()
  process.exit(0)
})
