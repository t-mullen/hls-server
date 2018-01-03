module.exports = HLSServer

var http = require('http')
var fs = require('fs')
var url = require('url')
var path = require('path')
var zlib = require('zlib')
var httpAttach = require('http-attach')

var CONTENT_TYPE = {
  MANIFEST: 'application/vnd.apple.mpegurl',
  SEGMENT: 'video/MP2T',
  HTML: 'text/html'
}

function HLSServer (server, opts) {
  var self = this
  if (!(self instanceof HLSServer)) return new HLSServer(server, opts)

  if (server) self.attach(server, opts)
}

HLSServer.prototype.attach = function (server, opts) {
  var self = this

  opts = opts || {}
  self.path = opts.path || self.path || '/'
  self.dir = opts.dir || self.dir || ''
  self.debugPlayer = opts.debugPlayer == null ? true : opts.debugPlayer

  if (isNaN(server)) {
    httpAttach(server, self._middleware.bind(self))
  } else {  // Port numbers
    var port = server
    server = http.createServer()
    httpAttach(server, self._middleware.bind(self))
    server.listen(port)
  }
}

HLSServer.prototype._middleware = function (req, res, next) {
  var self = this

  var uri = url.parse(req.url).pathname
  var relativePath = path.relative(self.path, uri)
  var filePath = path.join(self.dir, relativePath)
  var extension = path.extname(filePath)

  if (uri === '/player.html' && self.debugPlayer) {
    self._writeDebugPlayer(res, next)
    return
  }

  fs.exists(filePath, function (exists) {
    if (!exists) {
      res.writeHead(404)
      res.end()
    } else {
      switch (extension) {
        case '.m3u8':
          self._writeManifest(filePath, req, res, next)
          break
        case '.ts':
          self._writeSegment(filePath, res, next)
          break
        default:
          next()
          break
      }
    }
  })
}

HLSServer.prototype._writeDebugPlayer = function (res, next) {
  res.writeHead(200, { 'Content-Type': CONTENT_TYPE.HTML })
  // TODO: Use HLS.js
  res.write(`
    <html>
    <head><title>Debug Player</title></head>
      <body>
        <video src="" controls autoplay></video>
        <br>
        <input type="text" />
        <script>
          document.querySelector("input").addEventListener("keyup", function () {
            document.querySelector("video").src = document.querySelector("input").value
          })
        </script>
      </body>
    </html>`)
  res.end()
  next()
}

HLSServer.prototype._writeManifest = function (filePath, req, res, next) {
  fs.readFile(filePath, function (err, contents) {
    if (err || !contents) { // Error or empty playlist
      res.writeHead(500)
      res.end()
      return next()
    }

    res.writeHead(200, {'Content-Type': CONTENT_TYPE.MANIFEST})
    var ae = req.headers['accept-encoding']

    if (ae.match(/\bgzip\b/)) { // Gzip support
      zlib.gzip(contents, function (err, zip) {
        if (err) {
          res.writeHead(500)
          res.end()
          return next()
        }

        res.writeHead(200, {'content-encoding': 'gzip'})
        res.end(zip)
        next()
      })
    } else {
      res.end(contents, 'utf-8')
      next()
    }
  })
}

HLSServer.prototype._writeSegment = function (filePath, res, next) {
  res.writeHead(200, { 'Content-Type': CONTENT_TYPE.SEGMENT })
  fs.createReadStream(filePath, { bufferSize: 64 * 1024 }).pipe(res)
}
