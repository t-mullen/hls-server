module.exports = {}

module.exports.html = `
<html>
<head><title>Debug Player</title></head>
  <body>
  <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
  <video controls id="video"></video>
  <br>
  <input type="text" />
  <button id="load">Load</button>
  <script>
    if(Hls.isSupported()) {
      var video = document.getElementById('video');
      var hls = new Hls();
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED,function() {
        video.play();
      });
      document.querySelector("#load").addEventListener("click", function () {
        hls.loadSource(document.querySelector("input").value);
      })
   } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.addEventListener('canplay',function() {
        video.play();
      });
      document.querySelector("#load").addEventListener("click", function () {
        video.src = document.querySelector("input").value;
      })
    }
  </script>
  </body>
</html>`
