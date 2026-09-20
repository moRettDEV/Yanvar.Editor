var { dialog, BrowserWindow } = require("electron");
var { writeFileBytes } = require("./write-file.service");

async function saveFile(opts) {
  var win = BrowserWindow.getFocusedWindow() || undefined;
  var res = await dialog.showSaveDialog(win, {
    title: opts.title,
    defaultPath: opts.defaultPath,
    filters: opts.filters
  });
  if (res.canceled || !res.filePath) return null;
  await writeFileBytes(res.filePath, opts.bytes);
  return res.filePath;
}

module.exports = { saveFile };
