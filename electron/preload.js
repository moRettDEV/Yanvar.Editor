var { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("yanvar", {
  isElectron: true,
  pickBin: function () { return ipcRenderer.invoke("pick-bin"); },
  pickMap: function () { return ipcRenderer.invoke("pick-map"); },
  pickCompare: function () { return ipcRenderer.invoke("pick-compare"); },
  pickCte: function () { return ipcRenderer.invoke("pick-cte"); },
  saveBin: function (name, bytes) { return ipcRenderer.invoke("save-bin", { name: name, bytes: bytes }); },
  saveCte: function (name, bytes) { return ipcRenderer.invoke("save-cte", { name: name, bytes: bytes }); },
  saveAiExport: function (name, bytes) { return ipcRenderer.invoke("save-ai-export", { name: name, bytes: bytes }); },
  pickAiImport: function () { return ipcRenderer.invoke("pick-ai-import"); }
});
