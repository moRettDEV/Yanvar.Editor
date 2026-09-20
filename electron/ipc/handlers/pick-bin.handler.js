var { pickFile } = require("../../services/open-dialog.service");

function pickBin() {
  return pickFile({
    title: "Открыть прошивку",
    filters: [
      { name: "Прошивка", extensions: ["bin"] },
      { name: "Все файлы", extensions: ["*"] }
    ]
  });
}

module.exports = pickBin;
