var { pickFile } = require("../../services/open-dialog.service");

function pickCte() {
  return pickFile({
    title: "Импорт CTE",
    filters: [
      { name: "CTE", extensions: ["cte"] },
      { name: "Все файлы", extensions: ["*"] }
    ]
  });
}

module.exports = pickCte;
