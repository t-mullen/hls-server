module.exports = HLSServer

var http = require('http')
var fs = require('fs')
var url = require('url')
var path = require('path')
var zlib = require('zlib')
var httpAttach = require('http-attach')

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
  self.debugPlayer = opts.debugPlayer || true

  if (!isNaN(server)) { // Port numbers
    var port = server
    server = http.createServer()
    httpAttach(server, self._middleware.bind(self))
    server.listen(port)
  } else {
    httpAttach(server, self._middleware.bind(self))
  }
}

HLSServer.prototype._middleware = function (req, res, next) {
  var self = this

  var uri = url.parse(req.url).pathname
  var relativePath = path.relative(self.path, uri)
  var filePath = path.join(self.dir, relativePath)
  var ext = path.extname(filePath)

  if (uri === '/player.html' && self.debugPlayer) {
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.write('<html><head><title>Debug Player</title></head><body>')
    res.write('<video src="http://localhost:' + 8000 + '/out2.m3u8" controls autoplay></body></html>')
    res.end()
    return next()
  }

  fs.exists(filePath, function (exists) {
    if (!exists) {
      res.writeHead(404)
      res.end()
    } else {
      switch (ext) {
        case '.m3u8':
          fs.readFile(filePath, function (err, contents) {
            if (err || !contents) { // Error or empty playlist
              res.writeHead(500)
              res.end()
              return next()
            }

            res.writeHead(200, {'Content-Type': 'application/vnd.apple.mpegurl'})
            var ae = req.headers['accept-encoding']

            if (ae.match(/\bgzip\b/)) { // Gzip support
              zlib.gzip(contents, function (err, zip) {
                if (err) throw err

                res.writeHead(200, {'content-encoding': 'gzip'})
                res.end(zip)
              })
            } else {
              res.end(contents, 'utf-8')
            }
          })
          break
        case '.ts':
          res.writeHead(200, { 'Content-Type': 'video/MP2T' })
          fs.createReadStream(filePath, { bufferSize: 64 * 1024 }).pipe(res)
          break
        default:
          next()
          break
      }
    }
  })
}
