var { pickFile } = require("../../services/open-dialog.service");

function pickMap() {
  return pickFile({
    title: "Открыть карту",
    filters: [
      { name: "Карта", extensions: ["j5", "j7"] },
      { name: "Все файлы", extensions: ["*"] }
    ]
  });
}

module.exports = pickMap;
