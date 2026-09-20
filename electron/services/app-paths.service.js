var path = require("path");
var { app } = require("electron");

function editorRoot() {
  return app.isPackaged
    ? app.getAppPath()
    : path.join(__dirname, "..", "..");
}

function viewerJs() {
  return app.isPackaged
    ? path.join(process.resourcesPath, "lib")
    : path.join(__dirname, "..", "..", "lib");
}

function iconFile() {
  return path.join(editorRoot(), "build", "icon.png");
}

module.exports = { editorRoot, viewerJs, iconFile };
