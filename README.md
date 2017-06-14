# hls-server
[![Standard - JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)  

Simple HTTP middleware for serving HTTP Live Streaming (HLS) compatible media streams.  
*This package aims to be a complete yet concise HLS streaming solution when it is complete.*  

- [X] Input from video files (webm, mp4, mov, etc)
- [ ] Input from existing live streams (RTMP, RTSP, MPEG-DASH, etc)
- [ ] Input from RTMP streaming clients (FFMPEG, OBS, Adobe FMLE, etc)
- [ ] Adaptive Bitrate (ABR)
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
