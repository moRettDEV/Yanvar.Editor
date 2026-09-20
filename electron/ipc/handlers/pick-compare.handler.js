var { pickFile } = require("../../services/open-dialog.service");

function pickCompare() {
  return pickFile({
    title: "Сравнить с прошивкой",
    filters: [
      { name: "Прошивка", extensions: ["bin"] },
      { name: "Все файлы", extensions: ["*"] }
    ]
  });
}

module.exports = pickCompare;
