var fs = require('fs')

var fsProvider = {}

fsProvider.exists = function (req, cb) {
  fs.exists(req.filePath, function (exists) {
    cb(null, exists)
  })
}

fsProvider.getSegmentStream = function (req, cb) {
  cb(null, fs.createReadStream(req.filePath))
}

fsProvider.getManifestStream = function (req, cb) {
  cb(null, fs.createReadStream(req.filePath, { bufferSize: 64 * 1024 }))
}

module.exports = fsProvider
