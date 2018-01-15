module.exports = {}

module.exports.html = `
<html>
<head><title>Debug Player</title></head>
  <body>
    <video src="" controls autoplay></video>
    <br>
    <input type="text" />
    <script>
      document.querySelector("input").addEventListener("keyup", function () {
        document.querySelector("video").src = document.querySelector("input").value
      })
    </script>
  </body>
</html>`
