var { saveFile } = require("../../services/save-dialog.service");

function saveCte(_e, payload) {
  payload = payload || {};
  return saveFile({
    title: "Экспорт CTE",
    defaultPath: payload.name || "table.cte",
    bytes: payload.bytes,
    filters: [
      { name: "CTE", extensions: ["cte"] },
      { name: "Все файлы", extensions: ["*"] }
    ]
  });
}

module.exports = saveCte;
