# hls-server
Simple HTTP middleware for serving HTTP Live Streaming (HLS) compatible media streams.  

This package makes it easy to serve video over HLS.  

## Usage
First you need a compatible media stream (see [Producing Streams](#producing-streams))

Fast way:
```javascript
require('hls-server')(8000)
```

Detailed way:
```javascript
var HLSServer = require('hls-server')
var http = require('http')

var server = http.createServer()
var hls = new HLSServer(server, {
  path: '/',
  dir: ''
})
server.listen(8000)
```

### Producing Streams
HLS can only stream files that have been properly segmented. FFMPEG is great for this.  
Here is how to do it with [node-fluent-ffmpeg](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg).

```javascript
var ffmpeg = require('fluent-ffmpeg')

fmpeg('input.mp4', { timeout: 432000 }).addOptions([
    '-profile:v baseline',
    '-level 3.0',
    '-s 640x360',
    '-start_number 0',
    '-hls_time 10',
    '-hls_list_size 0',
    '-f hls'
  ]).output('output.mp4').on('end', cb).run()
```

### TODO:
- Publishing from streams instead of files.
