/* globals describe, it */
'use strict'
require('mochi')
var http = require('http')
var EventEmitter = require('events').EventEmitter

describe('http-attach', function () {
  var httpAttach = require('../')

  it('attaches handler to httpServer with original handler', function (done) {
    function handler (req, res) {
      handler.called = true
    }
    var server = http.createServer(handler)

    function handler2 (req, res, next) {
      handler2.called = true
    }

    httpAttach(server, handler2)
    var req = {}
    var res = {}
    server.emit('request', req, res)

    setTimeout(function () {
      handler2.called.should.equal(true)
      done()
    }, 10)
  })

  it('attached handler is called with req, res, next', function (done) {
    function handler (req, res) {
      handler.called = true
    }
    var server = http.createServer(handler)

    function handler2 (req, res, next) {
      handler2.called = true
      handler2.args = arguments
    }

    httpAttach(server, handler2)
    var req = {}
    var res = {}
    server.emit('request', req, res)

    setTimeout(function () {
      handler2.called.should.equal(true)
      handler2.args[0].should.equal(req)
      handler2.args[1].should.equal(res)
      handler2.args[2].should.be.a('function')
      done()
    }, 10)
  })

  // pre-ES6 v8 function name properies were not configurable
  if (Object.getOwnPropertyDescriptor(function () {}, 'name').configurable) {

    it('attaches with pretty display names, if possible', function () {
      var server = new http.Server()

      function handler2 (req, res, next) {
        handler2.called = true
      }

      httpAttach(server, handler2)

      server.listeners('request')[0].name.should.equal('handler2_attached')
    })
  }

  it('attaches handler to httpServer with no existing handler', function (done) {
    var server = new http.Server()

    function handler2 (req, res, next) {
      handler2.called = true
    }

    httpAttach(server, handler2)

    server.emit('request')

    setTimeout(function () {
      handler2.called.should.equal(true)
      done()
    }, 10)
  })

  it('does not call original handler unless yielded', function (done) {

    function handler (req, res) {
      handler.called = true
    }
    handler.called = false
    var server = http.createServer(handler)

    function handler2 (req, res, next) {
      handler2.called = true
    }
    handler2.called = false

    httpAttach(server, handler2)

    server.emit('request')

    setTimeout(function () {
      handler.called.should.equal(false)
      handler2.called.should.equal(true)
      done()
    }, 10)
  })

  it('yields to existing handler', function (done) {

    function handler (req2, res2) {
      req2.should.equal(req)
      res2.should.equal(res)
      done()
    }

    var server = http.createServer(handler)

    function handler2 (req, res, next) {
      // yield
      next()
    }

    var req = {}
    var res = {}
    httpAttach(server, handler2)

    server.emit('request', req, res)

  })
  it('ends connection if yields and no existing handler', function (done) {

    var server = new http.Server()

    function handler (req, res, next) {
      // yield
      next()
    }

    var req = {}
    var res = {
      end: end
    }
    function end () {
        res.statusCode.should.equal(404)
        done()
      }

    httpAttach(server, handler)

    server.emit('request', req, res)

  })

  describe('replaceListener', function () {
    it('swaps the first instance of an event handler', function () {
      var e = new EventEmitter()
      function listener () {}
      function listener2 () {}

      e.on('foo', listener)

      e.listeners('foo').should.deep.equal([listener])

      httpAttach.replaceListener(e, 'foo', listener2)

      e.listeners('foo').should.deep.equal([listener2])
    })
    it('removes all existing listeners and replaces with a single listener', function () {
      var e = new EventEmitter()
      function listener1 () {}
      function listener2 () {}
      function listener3 () {}

      e.on('foo', listener1)
      e.on('foo', listener2)

      e.listeners('foo').length.should.equal(2)

      httpAttach.replaceListener(e, 'foo', listener3)

      e.listeners('foo').length.should.equal(1)
    })
    it('returns the first original listener', function () {
      var e = new EventEmitter()
      function listener () {}
      function listener2 () {}

      e.on('foo', listener)

      var returnValue = httpAttach.replaceListener(e, 'foo', listener2)

      returnValue.should.equal(listener)

    })
  })

})

