var http = require("http");
var fs = require("fs");
var path = require("path");
var url = require("url");

var MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8"
};

function send(res, code, body, type) {
  res.writeHead(code, {
    "Content-Type": type || "text/plain; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(body);
}

function inside(file, root) {
  return file === root || file.indexOf(root + path.sep) === 0;
}

function createEditorServer(opts) {
  var ROOT = opts.root;
  var VIEWER_JS = opts.viewerJs;
  return http.createServer(function (req, res) {
    if (req.method !== "GET" && req.method !== "HEAD") return send(res, 405, "method");
    var p = decodeURIComponent(url.parse(req.url).pathname);
    if (p === "/") p = "/index.html";
    var file;
    if (p.indexOf("/lib/") === 0) {
      file = path.resolve(VIEWER_JS, p.slice(5));
      if (!inside(file, VIEWER_JS)) return send(res, 403, "forbidden");
    } else {
      file = path.resolve(ROOT, p.replace(/^\//, ""));
      if (!inside(file, ROOT)) return send(res, 403, "forbidden");
    }
    fs.readFile(file, function (err, buf) {
      if (err) return send(res, 404, "not found");
      send(res, 200, buf, MIME[path.extname(file)] || "application/octet-stream");
    });
  });
}

function listenEditor(opts, cb) {
  var server = createEditorServer(opts);
  var port = opts.port == null ? 8766 : opts.port;
  server.listen(port, "127.0.0.1", function () {
    var used = server.address().port;
    if (cb) cb(null, used, server);
  });
  server.on("error", function (err) {
    if (cb) cb(err);
  });
}

if (require.main === module) {
  var root = path.resolve(__dirname);
  listenEditor({
    root: root,
    viewerJs: path.resolve(__dirname, "lib"),
    port: 8766
  }, function (err, port) {
    if (err) throw err;
    console.log("Январь.редактор  http://127.0.0.1:" + port);
  });
}

module.exports = { createEditorServer, listenEditor };
