# hls-server
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![Travis](https://travis-ci.org/RationalCoding/hls-server.svg?branch=master)](https://travis-ci.org/RationalCoding/hls-server)

Simple HTTP middleware for serving HTTP Live Streaming (HLS) compatible media streams.  

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

// Below is FFMPEG converting MP4 to HLS with reasonable options.
// https://www.ffmpeg.org/ffmpeg-formats.html#hls-2
fmpeg('input.mp4', { timeout: 432000 }).addOptions([
    '-profile:v baseline', // baseline profile (level 3.0) for H264 video codec
    '-level 3.0', 
    '-s 640x360',          // 640px width, 360px height output video dimensions
    '-start_number 0',     // start the first .ts segment at index 0
    '-hls_time 10',        // 10 second segment duration
    '-hls_list_size 0',    // Maxmimum number of playlist entries (0 means all entries/infinite)
    '-f hls'               // HLS format
  ]).output('public/videos/output.m3u8').on('end', callback).run()
```

To create segments from an existing RTMP stream, use the following [node-fluent-ffmpeg](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg) command. You can expect several seconds of latency, depending on hardware.

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

## Using In-Memory Streams
By default, this module assumes files are kept in a directory on the local filesystem. If you want to stream files from another source (or don't want to relate URL paths to filesystem paths), you can specify a provider in the options like so:

```javascript
var hls = new HLSServer(server, {
  provider: {
    exists: function (req, callback) { // check if a file exists (always called before the below methods)
      callback(null, true)                 // File exists and is ready to start streaming
      callback(new Error("Server Error!")) // 500 error
      callback(null, false)                // 404 error
    },
    getManifestStream: function (req, callback) { // return the correct .m3u8 file
      // "req" is the http request
      // "callback" must be called with error-first arguments
      callback(null, myNodeStream)
      // or
      callback(new Error("Server error!"), null)
    },
    getSegmentStream: function (req, callback) { // return the correct .ts file
      callback(null, myNodeStream)
    }
  }
})
```

See `src/fsProvider.js` for the default provider using the local filesystem.

## CLI Tool

This package includes a CLI tool that can be installed globally with `npm install -g hls-server`.

To use, navigate to the directory where your `.ts` files are stored and run `hlsserver` in a command prompt. This will start a server on port 8000. (Use `hlsserver --help` to see additional options.)

The CLI tool will efficiently make use of multi-processor computers via the `cluster` module and can be used as an example of how to use the base module in the same way.

## Notes

To publish from an RTMP client like OBS, use a RTMP server like [rtmp-server-nodejs](https://github.com/RationalCoding/rtmp-server-nodejs) to echo the stream (direct streaming from that module is being worked on).

*NOTE: Transcoding live streams is very CPU-intensive. Most consumer hardware won't be able to handle transcoding more than a few streams.*

