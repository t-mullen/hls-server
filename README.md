# hls-server
[![Standard - JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)  

Simple HTTP middleware for serving HTTP Live Streaming (HLS) compatible media streams.  
*This package aims to be a complete yet concise HLS streaming solution when it is complete.*  

- [X] Input from video files (webm, mp4, mov, etc)
- [X] Input from existing live streams (RTMP)
- [X] Output as HLS live stream

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
  path: '/streams',     // Base URI to output HLS streams
  dir: 'public/videos'  // Directory that input files are stored
})
server.listen(8000)
```

### Producing Streams
HLS can only stream files that have been properly encoded and segmented. FFMPEG is great for this.  
Here is how to do it with [node-fluent-ffmpeg](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg).

```javascript
var ffmpeg = require('fluent-ffmpeg')

function callback() { // do something when encoding is done }

fmpeg('input.mp4', { timeout: 432000 }).addOptions([
    '-profile:v baseline',
    '-level 3.0',
    '-s 640x360',
    '-start_number 0',
    '-hls_time 10',
    '-hls_list_size 0',
    '-f hls'
  ]).output('public/videos/output.m3u8').on('end', callback).run()
```

To create segments from an existing RTMP stream, use the following [node-fluent-ffmpeg](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg) command. You can expect 20-50 seconds of latency, depending on hardware.

```javascript
var ffmpeg = require('fluent-ffmpeg')

// host, port and path to the RTMP stream
var host = 'localhost'
var port = '1935'
var path = '/live/test'

function callback() { // do something when stream ends and encoding finshes }

fmpeg('rtmp://'+host+':'+port+path, { timeout: 432000 }).addOptions([
    '-c:v libx264',
    '-c:a aac',
    '-ac 1',
    '-strict -2',
    '-crf 18',
    '-profile:v baseline',
    '-maxrate 400k',
    '-bufsize 1835k',
    '-pix_fmt yuv420p',
    '-hls_time 10',
    '-hls_list_size 6',
    '-hls_wrap 10',
    '-start_number 1'
  ]).output('public/videos/output.m3u8').on('end', callback).run()
```

To publish from an RTMP client like OBS, use a RTMP server like [rtmp-server-nodejs](https://github.com/RationalCoding/rtmp-server-nodejs) to echo the stream.

*NOTE: Transcoding live streams is very CPU-intensive. Most consumer hardware won't be able to handle transcoding more than a few streams.*

## CLI Tool

This package includes a CLI tool that can be installed globally with `npm install -g hls-server`.

To use, navigate to the directory where your `.ts` files are stored and run `hlsserver` in a command prompt. This will start a server on port 8000. (Use `hlsserver --help` to see additional options.)


