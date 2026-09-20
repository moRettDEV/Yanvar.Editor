var path = require("path");
var { dialog, BrowserWindow } = require("electron");
var { readFileBytes } = require("./read-file.service");

async function pickFile(opts) {
  var win = BrowserWindow.getFocusedWindow() || undefined;
  var res = await dialog.showOpenDialog(win, {
    title: opts.title,
    filters: opts.filters,
    properties: ["openFile"]
  });
  if (res.canceled || !res.filePaths[0]) return null;
  var filePath = res.filePaths[0];
  var bytes = await readFileBytes(filePath);
  return { name: path.basename(filePath), bytes: bytes };
}

module.exports = { pickFile };
