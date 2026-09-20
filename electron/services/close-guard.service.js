var { dialog } = require("electron");

function attachCloseGuard(win) {
  var closing = false;
  win.on("close", function (e) {
    if (closing) return;
    e.preventDefault();
    win.webContents.executeJavaScript("!!(typeof state !== 'undefined' && state.binDirty)")
      .then(function (dirty) {
        if (!dirty) {
          closing = true;
          win.close();
          return;
        }
        return dialog.showMessageBox(win, {
          type: "warning",
          buttons: ["Отмена", "Закрыть"],
          defaultId: 0,
          cancelId: 0,
          title: "Январь.редактор",
          message: "Есть несохранённые правки в прошивке.",
          detail: "Закрыть без сохранения?"
        }).then(function (res) {
          if (res.response === 1) {
            closing = true;
            win.close();
          }
        });
      })
      .catch(function () {
        closing = true;
        win.close();
      });
  });
}

module.exports = { attachCloseGuard };
