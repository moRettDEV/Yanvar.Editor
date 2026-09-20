var { ipcMain } = require("electron");
var pickBin = require("./handlers/pick-bin.handler");
var pickMap = require("./handlers/pick-map.handler");
var pickCompare = require("./handlers/pick-compare.handler");
var pickCte = require("./handlers/pick-cte.handler");
var saveBin = require("./handlers/save-bin.handler");
var saveCte = require("./handlers/save-cte.handler");
var saveAiExport = require("./handlers/save-ai-export.handler");

function registerIpc() {
  ipcMain.handle("pick-bin", pickBin);
  ipcMain.handle("pick-map", pickMap);
  ipcMain.handle("pick-compare", pickCompare);
  ipcMain.handle("pick-cte", pickCte);
  ipcMain.handle("save-bin", saveBin);
  ipcMain.handle("save-cte", saveCte);
  ipcMain.handle("save-ai-export", saveAiExport);
}

module.exports = { registerIpc };
