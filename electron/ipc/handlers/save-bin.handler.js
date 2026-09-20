var { saveFile } = require("../../services/save-dialog.service");

function saveBin(_e, payload) {
  payload = payload || {};
  return saveFile({
    title: "Сохранить прошивку",
    defaultPath: payload.name || "firmware.bin",
    bytes: payload.bytes,
    filters: [
      { name: "Прошивка", extensions: ["bin"] },
      { name: "Все файлы", extensions: ["*"] }
    ]
  });
}

module.exports = saveBin;
