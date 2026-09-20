var { saveFile } = require("../../services/save-dialog.service");

function saveAiExport(_e, payload) {
  payload = payload || {};
  var name = payload.name || "firmware-ai.json";
  var ext = (name.split(".").pop() || "json").toLowerCase();
  return saveFile({
    title: "Экспорт для ИИ",
    defaultPath: name,
    bytes: payload.bytes,
    filters: [
      { name: "JSON", extensions: ["json"] },
      { name: "Markdown", extensions: ["md"] },
      { name: "Текст", extensions: ["txt"] },
      { name: "Все файлы", extensions: ["*"] }
    ].sort(function (a, b) {
      return a.extensions[0] === ext ? -1 : b.extensions[0] === ext ? 1 : 0;
    })
  });
}

module.exports = saveAiExport;
