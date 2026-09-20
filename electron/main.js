var { app } = require("electron");
var { listenEditor } = require("../server");
var { editorRoot, viewerJs } = require("./services/app-paths.service");
var { createWindow } = require("./services/create-window.service");
var { registerIpc } = require("./ipc/register");

app.whenReady().then(function () {
  registerIpc();
  listenEditor({
    root: editorRoot(),
    viewerJs: viewerJs(),
    port: 0
  }, function (err, port) {
    if (err) {
      console.error(err);
      app.quit();
      return;
    }
    createWindow(port);
  });
});

app.on("window-all-closed", function () {
  app.quit();
});
