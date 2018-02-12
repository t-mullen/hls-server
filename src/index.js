module.exports = HLSServer

var http = require('http')
var url = require('url')
var path = require('path')
var zlib = require('zlib')
var httpAttach = require('http-attach')
var fsProvider = require('./fsProvider')
var debugPlayer = require('./debugPlayer')

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

  self.provider = opts.provider || fsProvider

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

  req.filePath = filePath

  // Gzip support
  var ae = req.headers['accept-encoding'] || ''
  req.acceptsCompression = ae.match(/\bgzip\b/)

  if (uri === '/player.html' && self.debugPlayer) {
    self._writeDebugPlayer(res, next)
    return
  }

  self.provider.exists(req, function (err, exists) {
    if (err) {
      res.statusCode = 500
      res.end()
    } else if (!exists) {
      res.statusCode = 404
      res.end()
    } else {
      switch (extension) {
        case '.m3u8':
          self._writeManifest(req, res, next)
          break
        case '.ts':
          self._writeSegment(req, res, next)
          break
        default:
          next()
          break
      }
    }
  })
}

HLSServer.prototype._writeDebugPlayer = function (res, next) {
  res.setHeader('Content-Type', CONTENT_TYPE.HTML)
  res.statusCode = 200
  // TODO: Use HLS.js
  res.write(debugPlayer.html)
  res.end()
  next()
}

HLSServer.prototype._writeManifest = function (req, res, next) {
  var self = this

  self.provider.getManifestStream(req, function (err, stream) {
    if (err) {
      res.statusCode = 500
      res.end()
      return next()
    }

    res.setHeader('Content-Type', CONTENT_TYPE.MANIFEST)
    res.statusCode = 200

    if (req.acceptsCompression) {
      res.setHeader('content-encoding', 'gzip')
      res.statusCode = 200
      var gzip = zlib.createGzip()
      stream.pipe(gzip).pipe(res)
    } else {
      stream.pipe(res, 'utf-8')
    }
  })
}

HLSServer.prototype._writeSegment = function (req, res, next) {
  var self = this

  self.provider.getSegmentStream(req, function (err, stream) {
    if (err) {
      res.statusCode = 500
      res.end()
      return
    }
    res.setHeader('Content-Type', CONTENT_TYPE.SEGMENT)
    res.statusCode = 200
    stream.pipe(res)
  })
}
