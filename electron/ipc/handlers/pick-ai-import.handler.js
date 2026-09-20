var { pickFile } = require("../../services/open-dialog.service");

function pickAiImport() {
  return pickFile({
    title: "Импорт из ИИ",
    filters: [
      { name: "JSON", extensions: ["json"] },
      { name: "Markdown", extensions: ["md"] },
      { name: "Текст", extensions: ["txt"] },
      { name: "Все файлы", extensions: ["*"] }
    ]
  });
}

module.exports = pickAiImport;
