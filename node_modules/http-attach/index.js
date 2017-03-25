'use strict'

function httpAttach (httpServer, handler) {

  function attached (req, res) {
    var next = originalHandler ? function next () {
      originalHandler(req, res)
    } : function end () {
      res.statusCode = 404
      res.end()
    }

    handler(req, res, next)
  }

  Object.defineProperty(attached, 'name', {
    value: (handler.name && handler.name + '_' || '') + 'attached'
  })

  var originalHandler = replaceListener(httpServer, 'request', attached)
}

function replaceListener (eventEmitter, eventName, newListener) {
  var originalListener = eventEmitter.listeners(eventName)[0]
  eventEmitter.removeAllListeners(eventName)
  eventEmitter.addListener(eventName, newListener)
  return originalListener
}

module.exports = httpAttach
module.exports.replaceListener = replaceListener
