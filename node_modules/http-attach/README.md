# http-attach
write services that attach to existing httpServer instances

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)
[![Build Status](https://travis-ci.org/zendesk/node-http-attach.svg?branch=master)](https://travis-ci.org/zendesk/node-http-attach)


## what's this for?
Let's say you want to write a small module of functionality - responding to a single http route, for example - and want to give the module a way to register itself without depending on a specific framework, like connect, express, or hapi.

This lets you implement functionality like socket.io's `socketio.attach(httpServer)``


## usage
```js
var httpAttach = require('http-attach')

function middleware (req, res, next) {
    console.log('this middleware is neat & useful')
    next()
}

middleware.attach = function (httpServer) {
    httpAttach(httpServer, middleware)
}


module.exports = middleware
```

`httpServer` should be an [`HttpServer`](https://nodejs.org/api/http.html#http_class_http_server) or `HttpsServer` instance.

This replaces the existing `request` event handler so you can additional control point for your program logic. You can yield to the existing handler by calling the `next()` function you get as the third argument, like connect-style middleware.

If there is no existing request handler, calling `next()` will end the request with a 404 status code.


## installation

    $ npm install http-attach


## running the tests

From package root:

    $ npm install
    $ npm test


## contributors

- jden <jason@denizac.org>


## license

Apache 2.0. (c) 2016 Zendesk, Inc. See LICENSE.md
