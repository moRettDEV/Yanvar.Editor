var path = require("path");
var { BrowserWindow } = require("electron");
var { attachCloseGuard } = require("./close-guard.service");
var { iconFile } = require("./app-paths.service");

function createWindow(port) {
  var win = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: "#000000",
    title: "Январь.редактор",
    icon: iconFile(),
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "..", "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });
  attachCloseGuard(win);
  win.loadURL("http://127.0.0.1:" + port + "/");
  return win;
}

module.exports = { createWindow };
